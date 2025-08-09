import { users, hotels, rooms, bookings, generatorLogs, attendanceLogs, qrCodes, payments, messageLogs, type User, type InsertUser, type Hotel, type InsertHotel, type Room, type InsertRoom, type Booking, type InsertBooking, type GeneratorLog, type InsertGeneratorLog, type AttendanceLog, type InsertAttendanceLog, type QRCode, type InsertQRCode, type Payment, type InsertPayment, type MessageLog, type InsertMessageLog } from "@shared/schema";
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
  
  // QR Code methods
  createQRCode(qrCode: InsertQRCode): Promise<QRCode>;
  getQRCodeByCode(code: string): Promise<QRCode | undefined>;
  updateQRCode(id: string, updates: Partial<InsertQRCode>): Promise<QRCode>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByHotel(hotelId: string): Promise<Payment[]>;
  updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment>;
  
  // Message log methods
  createMessageLog(messageLog: InsertMessageLog): Promise<MessageLog>;
  getMessageLogsByHotel(hotelId: string): Promise<MessageLog[]>;
  updateMessageLog(id: string, updates: Partial<InsertMessageLog>): Promise<MessageLog>;
  
  // New methods for owner-first flow
  getAllUsers(): Promise<User[]>;
  getUnassignedHotelOwners(): Promise<User[]>;
  getUsersByHotel(hotelId: string): Promise<User[]>;
  
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

  async getAllHotels(): Promise<Hotel[]> {
    return await this.getHotels();
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

  async getUsersByHotel(hotelId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.hotelId, hotelId));
  }

  // QR Code methods implementation
  async createQRCode(qrCode: InsertQRCode): Promise<QRCode> {
    const [result] = await db.insert(qrCodes).values(qrCode).returning();
    return result;
  }

  async getQRCodeByCode(code: string): Promise<QRCode | undefined> {
    const [qrCode] = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
    return qrCode || undefined;
  }

  async updateQRCode(id: string, updates: Partial<InsertQRCode>): Promise<QRCode> {
    const [qrCode] = await db.update(qrCodes).set(updates).where(eq(qrCodes.id, id)).returning();
    return qrCode;
  }

  // Payment methods implementation
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(payment).returning();
    return result;
  }

  async getPaymentsByHotel(hotelId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.hotelId, hotelId));
  }

  async updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return payment;
  }

  // Message log methods implementation
  async createMessageLog(messageLog: InsertMessageLog): Promise<MessageLog> {
    const [result] = await db.insert(messageLogs).values(messageLog).returning();
    return result;
  }

  async getMessageLogsByHotel(hotelId: string): Promise<MessageLog[]> {
    return await db.select().from(messageLogs).where(eq(messageLogs.hotelId, hotelId));
  }

  async updateMessageLog(id: string, updates: Partial<InsertMessageLog>): Promise<MessageLog> {
    const [messageLog] = await db.update(messageLogs).set(updates).where(eq(messageLogs.id, id)).returning();
    return messageLog;
  }
}

export const storage = new DatabaseStorage();
