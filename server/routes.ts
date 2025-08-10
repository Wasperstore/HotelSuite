import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertHotelSchema, insertUserSchema, insertRoomSchema, insertBookingSchema, insertGeneratorLogSchema } from "@shared/schema";
import { z } from "zod";
import { domainSeparationMiddleware, requireSuperAdminDomain } from "./middleware/domain-separation";
import { generateTempPassword, generateInviteToken, createInviteEmail, createPasswordResetEmail, sendEmail } from "./utils/email";
import { generateQRCode, validateQRCode } from "./utils/qr-generator";
import { generateICalFeed, syncOTABookings } from "./utils/ical-sync";
import { paymentService } from "./utils/payment-integration";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export function registerRoutes(app: Express): Server {
  // Apply domain separation middleware
  app.use(domainSeparationMiddleware);
  
  setupAuth(app);

  // Super Admin Routes
  app.get("/api/admin/hotels", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const hotels = await storage.getHotels();
      res.json(hotels);
    } catch (error) {
      next(error);
    }
  });

  // Update hotel logo
  app.patch("/api/hotels/:hotelId/logo", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { hotelId } = req.params;
      const { logoUrl } = req.body;

      // Validate user has permission to update this hotel
      const userRole = req.user?.role;
      const userHotelId = req.user?.hotelId;

      if (userRole === "SUPER_ADMIN" || userRole === "DEVELOPER_ADMIN") {
        // Super admins can update any hotel
      } else if (userRole === "HOTEL_OWNER" && userHotelId === hotelId) {
        // Hotel owners can update their own hotel
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedHotel = await storage.updateHotelLogo(hotelId, logoUrl);
      res.json(updatedHotel);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/hotels", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertHotelSchema.parse(req.body);
      
      // Validate that the owner exists and is unassigned
      if (validatedData.ownerId) {
        const owner = await storage.getUser(validatedData.ownerId);
        if (!owner || owner.role !== "HOTEL_OWNER" || owner.hotelId) {
          return res.status(400).json({ message: "Invalid owner: must be an unassigned hotel owner" });
        }
      }

      const hotel = await storage.createHotel(validatedData);
      
      // Assign the owner to this hotel
      if (validatedData.ownerId) {
        await storage.updateUser(validatedData.ownerId, { hotelId: hotel.id });
      }
      
      res.status(201).json(hotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/admin/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Validate input using zod schema
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username || "");
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password before storing  
      const hashedPassword = await hashPassword(validatedData.password);
      
      const { password, ...userDataWithoutPassword } = validatedData;
      const user = await storage.createUser({
        ...userDataWithoutPassword,
        password: hashedPassword
      });
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/admin/users/:userId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { userId } = req.params;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deletion of own account
      if (userId === req.user?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Super Admin specific routes for enhanced dashboard
  app.get("/api/admin/system-stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const hotels = await storage.getHotels();
      const users = await storage.getAllUsers();
      
      // Calculate system statistics
      const stats = {
        totalHotels: hotels.length,
        activeUsers: users.filter(u => u.role !== 'GUEST').length,
        activeSubscriptions: hotels.filter(h => h.status === 'active').length,
        monthlyRevenue: 2450000, // This would come from payments table in real implementation
        supportTicketsPending: 8, // This would come from support tickets table
        apiUptime: 99.9,
        dbUsage: 67.3
      };
      
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/revenue-data", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Mock revenue data - in real app this would come from payments/subscriptions tables
      const revenueData = [
        { month: 'Jan', revenue: 1800000, signups: 8 },
        { month: 'Feb', revenue: 2100000, signups: 12 },
        { month: 'Mar', revenue: 2450000, signups: 15 },
      ];
      
      res.json(revenueData);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/support-tickets", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Mock support tickets - in real app this would come from support_tickets table
      const tickets = [
        {
          id: '1',
          hotelName: 'Lagos Grand Hotel',
          subject: 'Payment gateway integration issue',
          priority: 'high',
          status: 'open',
          createdAt: new Date(),
          assignedTo: 'Support Team'
        },
        {
          id: '2',
          hotelName: 'Abuja Luxury Suites',
          subject: 'Room booking synchronization problem',
          priority: 'medium',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000),
        }
      ];
      
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/support-tickets/:ticketId/assign", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { ticketId } = req.params;
      const { assignedTo } = req.body;
      
      // In real app, update support ticket assignment
      console.log(`Assigned ticket ${ticketId} to ${assignedTo}`);
      
      res.json({ success: true, message: "Ticket assigned successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/subscription-plans", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Mock subscription plans - in real app this would come from subscription_plans table
      const plans = [
        {
          id: '1',
          name: 'Starter',
          price: 35000,
          currency: 'NGN',
          interval: 'monthly',
          features: ['Up to 20 rooms', 'Basic reporting', 'Email support'],
          roomLimit: 20,
          staffLimit: 5,
          isActive: true
        },
        {
          id: '2',
          name: 'Professional',
          price: 75000,
          currency: 'NGN',
          interval: 'monthly',
          features: ['Up to 100 rooms', 'Advanced analytics', 'Priority support', 'API access'],
          roomLimit: 100,
          staffLimit: 25,
          isActive: true
        },
        {
          id: '3',
          name: 'Enterprise',
          price: 120000,
          currency: 'NGN',
          interval: 'monthly',
          features: ['Unlimited rooms', 'Custom integrations', '24/7 support', 'White-label'],
          roomLimit: -1,
          staffLimit: -1,
          isActive: true
        }
      ];
      
      res.json(plans);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/hotel-owners", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userData = {
        ...req.body,
        role: 'HOTEL_OWNER' as const,
        password: await hashPassword(req.body.password),
        forcePasswordReset: true
      };
      
      const validatedData = insertUserSchema.parse(userData);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/admin/hotels/:hotelId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { hotelId } = req.params;
      const validatedData = insertHotelSchema.partial().parse(req.body);
      
      const hotel = await storage.updateHotel(hotelId, validatedData);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      res.json(hotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  // OTA iCal sync routes
  app.get("/api/hotels/:hotelId/ical", async (req, res, next) => {
    try {
      const { hotelId } = req.params;
      
      const ical = await generateICalFeed(hotelId);
      
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="hotel-${hotelId}-bookings.ics"`);
      res.send(ical);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hotels/:hotelId/sync-ota", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !['SUPER_ADMIN', 'HOTEL_OWNER', 'HOTEL_MANAGER'].includes(req.user?.role || '')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { hotelId } = req.params;
      const { platform, icalUrl } = req.body;

      const result = await syncOTABookings(hotelId, platform, icalUrl);
      
      res.json({
        message: "OTA sync completed",
        synced: result.synced,
        errors: result.errors
      });
    } catch (error) {
      next(error);
    }
  });

  // QR Code routes
  app.get("/api/qr/:code", async (req, res, next) => {
    try {
      const { code } = req.params;
      
      const result = await validateQRCode(code);
      
      if (!result.valid) {
        return res.status(404).json({ error: result.error });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hotels/:hotelId/qr-codes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { hotelId } = req.params;
      const { type, roomId, data } = req.body;

      const qrCode = await generateQRCode({
        type,
        hotelId,
        roomId,
        data
      });
      
      res.json({ qrCode });
    } catch (error) {
      next(error);
    }
  });

  // Mobile room key routes
  app.post("/api/room-access/log", async (req, res, next) => {
    try {
      const { keyId, action, timestamp, deviceInfo } = req.body;
      
      // Log room access attempt
      console.log(`Room access log: ${keyId} - ${action} at ${timestamp} from ${deviceInfo}`);
      
      // In production, save to database
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Biometric authentication routes
  app.post("/api/auth/biometric-log", async (req, res, next) => {
    try {
      const { staffId, method, timestamp, deviceInfo, success } = req.body;
      
      // Log biometric authentication attempt
      console.log(`Biometric auth: ${staffId} - ${method} - ${success ? 'Success' : 'Failed'} at ${timestamp}`);
      
      // In production, save to attendance logs
      res.json({ logged: true });
    } catch (error) {
      next(error);
    }
  });

  // Payment Integration Routes
  app.post("/api/payments/initialize", async (req, res, next) => {
    try {
      const { provider, amount, currency, customerEmail, customerName, customerPhone, reference, description, callbackUrl } = req.body;

      if (!provider || !amount || !currency || !customerEmail || !reference) {
        return res.status(400).json({ message: "Missing required payment parameters" });
      }

      const paymentResult = await paymentService.initializePayment(provider, {
        amount,
        currency,
        customerEmail,
        customerName,
        customerPhone,
        reference,
        description: description || 'Hotel Booking Payment',
        callbackUrl
      });

      res.json(paymentResult);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/verify", async (req, res, next) => {
    try {
      const { provider, reference } = req.body;

      if (!provider || !reference) {
        return res.status(400).json({ message: "Provider and reference are required" });
      }

      const verification = await paymentService.verifyPayment(provider, reference);
      res.json(verification);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/payments/providers", async (req, res, next) => {
    try {
      const { country, currency } = req.query;

      if (!country || !currency) {
        return res.status(400).json({ message: "Country and currency parameters are required" });
      }

      const bestProvider = paymentService.getBestProvider(country as string, currency as string);
      
      res.json({
        recommended: bestProvider,
        available: paymentService.getBestProvider(country as string, currency as string) ? [bestProvider] : []
      });
    } catch (error) {
      next(error);
    }
  });

  // Create Hotel Owner endpoint (Owner-First Flow)
  app.post("/api/admin/hotel-owners", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const ownerData = insertUserSchema.omit({ hotelId: true, tenantId: true }).parse(req.body);
      
      // Ensure role is HOTEL_OWNER
      const hotelOwner = await storage.createUser({
        ...ownerData,
        role: "HOTEL_OWNER",
        forcePasswordReset: true // Force password reset on first login
      });
      
      res.status(201).json(hotelOwner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      next(error);
    }
  });

  // Get unassigned hotel owners
  app.get("/api/admin/unassigned-owners", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const unassignedOwners = await storage.getUnassignedHotelOwners();
      res.json(unassignedOwners);
    } catch (error) {
      next(error);
    }
  });

  // Hotel Management Routes
  app.get("/api/hotels/:hotelId/rooms", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { hotelId } = req.params;
      
      // Check if user has access to this hotel
      if (req.user?.hotelId !== hotelId && req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }

      const rooms = await storage.getRoomsByHotel(hotelId);
      res.json(rooms);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hotels/:hotelId/bookings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { hotelId } = req.params;
      
      // Check if user has access to this hotel
      if (req.user?.hotelId !== hotelId && req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getBookingsByHotel(hotelId);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hotels/:hotelId/generator-logs", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { hotelId } = req.params;
      
      // Check if user has access to this hotel
      if (req.user?.hotelId !== hotelId && req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }

      const logs = await storage.getGeneratorLogsByHotel(hotelId);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });

  // Hotel Owner/Manager Routes for Room and Staff Management
  app.get("/api/hotels/:hotelId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { hotelId } = req.params;
      
      // Check if user has access to this hotel
      if (req.user?.hotelId !== hotelId && req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const hotel = await storage.getHotel(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      res.json(hotel);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hotels/:hotelId/rooms", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { hotelId } = req.params;
      
      // Check if user has permission to create rooms for this hotel
      if (req.user?.hotelId !== hotelId && req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }

      const room = await storage.createRoom({
        ...req.body,
        hotelId,
        status: 'available'
      });
      
      res.status(201).json(room);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hotels/:hotelId/staff", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { hotelId } = req.params;
      
      // Check if user has access to this hotel
      if (req.user?.hotelId !== hotelId && req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }

      const staff = await storage.getUsersByHotel(hotelId);
      res.json(staff);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hotels/:hotelId/staff", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { hotelId } = req.params;
      
      // Check if user has permission to create staff for this hotel
      if (req.user?.hotelId !== hotelId && req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "DEVELOPER_ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }

      // Hash the PIN code for authentication
      const { scrypt, randomBytes } = require('crypto');
      const { promisify } = require('util');
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString('hex');
      const buf = await scryptAsync(req.body.pinCode, salt, 64);
      const pinHash = `${buf.toString('hex')}.${salt}`;

      const staff = await storage.createUser({
        ...req.body,
        hotelId,
        pinHash,
        passwordHash: pinHash, // Use PIN as password initially
        forcePasswordReset: false
      });
      
      res.status(201).json(staff);
    } catch (error) {
      next(error);
    }
  });

  // Public booking routes (for guest bookings)
  app.get("/api/public/hotels/:slug", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const hotel = await storage.getHotelBySlug(slug);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      res.json(hotel);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/public/hotels/:slug/rooms", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const hotel = await storage.getHotelBySlug(slug);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const rooms = await storage.getRoomsByHotel(hotel.id);
      res.json(rooms);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/public/hotels/:slug/bookings", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const hotel = await storage.getHotelBySlug(slug);
      
      if (!hotel || hotel.status !== 'active') {
        return res.status(404).json({ message: "Hotel not found or inactive" });
      }

      const booking = await storage.createBooking({
        ...req.body,
        hotelId: hotel.id,
      });
      
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
