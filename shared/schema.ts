import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, uuid, integer, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", [
  "SUPER_ADMIN",
  "DEVELOPER_ADMIN", 
  "HOTEL_OWNER",
  "HOTEL_MANAGER",
  "FRONT_DESK",
  "HOUSEKEEPING",
  "MAINTENANCE",
  "ACCOUNTING",
  "POS_STAFF",
  "GUEST"
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }),
  fullName: varchar("full_name", { length: 255 }),
  passwordHash: text("password_hash"),
  pinHash: text("pin_hash"),
  role: roleEnum("role").notNull(),
  hotelId: uuid("hotel_id"),
  tenantId: uuid("tenant_id"),
  forcePasswordReset: boolean("force_password_reset").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at")
});

export const hotels = pgTable("hotels", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).unique(),
  ownerId: uuid("owner_id"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow()
});

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  label: varchar("label", { length: 100 }),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("available")
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  roomId: uuid("room_id"),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }).notNull(),
  checkinDate: timestamp("checkin_date").notNull(),
  checkoutDate: timestamp("checkout_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  holdExpires: timestamp("hold_expires"),
  createdAt: timestamp("created_at").defaultNow()
});

export const generatorLogs = pgTable("generator_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  liters: decimal("liters", { precision: 8, scale: 2 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const attendanceLogs = pgTable("attendance_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  hotelId: uuid("hotel_id").notNull(),
  punchIn: timestamp("punch_in"),
  punchOut: timestamp("punch_out"),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [users.hotelId],
    references: [hotels.id]
  }),
  attendanceLogs: many(attendanceLogs)
}));

export const hotelsRelations = relations(hotels, ({ one, many }) => ({
  owner: one(users, {
    fields: [hotels.ownerId],
    references: [users.id]
  }),
  users: many(users),
  rooms: many(rooms),
  bookings: many(bookings),
  generatorLogs: many(generatorLogs),
  attendanceLogs: many(attendanceLogs)
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotelId],
    references: [hotels.id]
  }),
  bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  hotel: one(hotels, {
    fields: [bookings.hotelId],
    references: [hotels.id]
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id]
  })
}));

export const generatorLogsRelations = relations(generatorLogs, ({ one }) => ({
  hotel: one(hotels, {
    fields: [generatorLogs.hotelId],
    references: [hotels.id]
  })
}));

export const attendanceLogsRelations = relations(attendanceLogs, ({ one }) => ({
  user: one(users, {
    fields: [attendanceLogs.userId],
    references: [users.id]
  }),
  hotel: one(hotels, {
    fields: [attendanceLogs.hotelId],
    references: [hotels.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  deletedAt: true
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
  createdAt: true
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});

export const insertGeneratorLogSchema = createInsertSchema(generatorLogs).omit({
  id: true,
  createdAt: true
});

export const insertAttendanceLogSchema = createInsertSchema(attendanceLogs).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type GeneratorLog = typeof generatorLogs.$inferSelect;
export type InsertGeneratorLog = z.infer<typeof insertGeneratorLogSchema>;
export type AttendanceLog = typeof attendanceLogs.$inferSelect;
export type InsertAttendanceLog = z.infer<typeof insertAttendanceLogSchema>;
