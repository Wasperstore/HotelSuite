import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertHotelSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
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

  const httpServer = createServer(app);
  return httpServer;
}
