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
      const hotel = await storage.createHotel(validatedData);
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
      
      // This would need pagination in production
      res.json({ message: "Users endpoint - implement pagination" });
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
