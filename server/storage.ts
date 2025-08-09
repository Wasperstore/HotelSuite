import { users, hotels, rooms, bookings, generatorLogs, attendanceLogs, type User, type InsertUser, type Hotel, type InsertHotel, type Room, type InsertRoom, type Booking, type InsertBooking, type GeneratorLog, type InsertGeneratorLog, type AttendanceLog, type InsertAttendanceLog } from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  getHotel(id: string): Promise<Hotel | undefined>;
  getHotelBySlug(slug: string): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: string, updates: Partial<InsertHotel>): Promise<Hotel>;
  deleteHotel(id: string): Promise<void>;
  getHotels(): Promise<Hotel[]>;
  
  getRoomsByHotel(hotelId: string): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, updates: Partial<InsertRoom>): Promise<Room>;
  deleteRoom(id: string): Promise<void>;
  
  getBookingsByHotel(hotelId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  
  getGeneratorLogsByHotel(hotelId: string): Promise<GeneratorLog[]>;
  createGeneratorLog(log: InsertGeneratorLog): Promise<GeneratorLog>;
  
  getAttendanceLogsByHotel(hotelId: string): Promise<AttendanceLog[]>;
  createAttendanceLog(log: InsertAttendanceLog): Promise<AttendanceLog>;
  
  // New methods for owner-first flow
  getAllUsers(): Promise<User[]>;
  getUnassignedHotelOwners(): Promise<User[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getHotel(id: string): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel || undefined;
  }

  async getHotelBySlug(slug: string): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.slug, slug));
    return hotel || undefined;
  }

  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    const [hotel] = await db
      .insert(hotels)
      .values(insertHotel)
      .returning();
    return hotel;
  }

  async updateHotel(id: string, updates: Partial<InsertHotel>): Promise<Hotel> {
    const [hotel] = await db
      .update(hotels)
      .set(updates)
      .where(eq(hotels.id, id))
      .returning();
    return hotel;
  }

  async deleteHotel(id: string): Promise<void> {
    await db.delete(hotels).where(eq(hotels.id, id));
  }

  async getHotels(): Promise<Hotel[]> {
    return await db.select().from(hotels);
  }

  async getRoomsByHotel(hotelId: string): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.hotelId, hotelId));
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db
      .insert(rooms)
      .values(insertRoom)
      .returning();
    return room;
  }

  async updateRoom(id: string, updates: Partial<InsertRoom>): Promise<Room> {
    const [room] = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }

  async deleteRoom(id: string): Promise<void> {
    await db.delete(rooms).where(eq(rooms.id, id));
  }

  async getBookingsByHotel(hotelId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.hotelId, hotelId));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async getGeneratorLogsByHotel(hotelId: string): Promise<GeneratorLog[]> {
    return await db.select().from(generatorLogs).where(eq(generatorLogs.hotelId, hotelId));
  }

  async createGeneratorLog(insertLog: InsertGeneratorLog): Promise<GeneratorLog> {
    const [log] = await db
      .insert(generatorLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getAttendanceLogsByHotel(hotelId: string): Promise<AttendanceLog[]> {
    return await db.select().from(attendanceLogs).where(eq(attendanceLogs.hotelId, hotelId));
  }

  async createAttendanceLog(insertLog: InsertAttendanceLog): Promise<AttendanceLog> {
    const [log] = await db
      .insert(attendanceLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUnassignedHotelOwners(): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        eq(users.role, "HOTEL_OWNER"),
        isNull(users.hotelId)
      )
    );
  }
}

export const storage = new DatabaseStorage();
