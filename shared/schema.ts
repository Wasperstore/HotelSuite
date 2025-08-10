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
  address: text("address"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  totalRooms: integer("total_rooms").default(0),
  maxStaff: integer("max_staff").default(10),
  description: text("description"),
  amenities: text("amenities").array(),
  facilities: text("facilities").array(),
  services: text("services").array(),
  currency: varchar("currency", { length: 10 }).default("NGN"),
  defaultLanguage: varchar("default_language", { length: 10 }).default("en"),
  website: varchar("website", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow()
});

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  label: varchar("label", { length: 100 }),
  type: varchar("type", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  capacity: integer("capacity").default(2),
  amenities: text("amenities").array(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow()
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  roomId: uuid("room_id"),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }).notNull(),
  guestPhone: varchar("guest_phone", { length: 20 }),
  checkinDate: timestamp("checkin_date").notNull(),
  checkoutDate: timestamp("checkout_date").notNull(),
  numberOfGuests: integer("number_of_guests").default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  specialRequests: text("special_requests"),
  holdExpires: timestamp("hold_expires"),
  createdAt: timestamp("created_at").defaultNow()
});

export const generatorLogs = pgTable("generator_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  logType: varchar("log_type", { length: 50 }).notNull(), // 'FUEL_PURCHASE', 'USAGE', 'MAINTENANCE'
  fuelAmount: decimal("fuel_amount", { precision: 8, scale: 2 }),
  fuelConsumed: decimal("fuel_consumed", { precision: 8, scale: 2 }),
  hoursRun: decimal("hours_run", { precision: 6, scale: 2 }),
  costPerLiter: decimal("cost_per_liter", { precision: 8, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  maintenanceType: varchar("maintenance_type", { length: 50 }),
  maintenanceNotes: text("maintenance_notes"),
  recordedBy: uuid("recorded_by"),
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

// QR Code table for contactless features
export const qrCodes = pgTable("qr_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  roomId: uuid("room_id"),
  type: varchar("type", { length: 50 }).notNull(), // 'MENU', 'CHECKIN', 'ROOM_SERVICE', 'WIFI'
  code: varchar("code", { length: 255 }).notNull().unique(),
  data: text("data"), // JSON data for the QR code
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Payment records
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  bookingId: uuid("booking_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("NGN"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // 'PAYSTACK', 'FLUTTERWAVE', 'STRIPE', 'CASH', 'TRANSFER'
  paymentReference: varchar("payment_reference", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'completed', 'failed', 'refunded'
  metadata: text("metadata"), // JSON metadata from payment provider
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// WhatsApp/SMS Message logs
export const messageLogs = pgTable("message_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: uuid("hotel_id").notNull(),
  bookingId: uuid("booking_id"),
  recipient: varchar("recipient", { length: 20 }).notNull(),
  messageType: varchar("message_type", { length: 50 }).notNull(), // 'WHATSAPP', 'SMS'
  template: varchar("template", { length: 100 }), // Template used
  content: text("content").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'sent', 'delivered', 'failed'
  messageId: varchar("message_id", { length: 255 }), // Provider message ID
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow()
});

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

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  hotel: one(hotels, {
    fields: [qrCodes.hotelId],
    references: [hotels.id]
  }),
  room: one(rooms, {
    fields: [qrCodes.roomId],
    references: [rooms.id]
  })
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  hotel: one(hotels, {
    fields: [payments.hotelId],
    references: [hotels.id]
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id]
  })
}));

export const messageLogsRelations = relations(messageLogs, ({ one }) => ({
  hotel: one(hotels, {
    fields: [messageLogs.hotelId],
    references: [hotels.id]
  }),
  booking: one(bookings, {
    fields: [messageLogs.bookingId],
    references: [bookings.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
  passwordHash: true,
  pinHash: true
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  pin: z.string().optional()
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
  createdAt: true
}).extend({
  totalRooms: z.coerce.number().min(1, "Must have at least 1 room"),
  maxStaff: z.coerce.number().min(1, "Must allow at least 1 staff member")
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

export const insertQRCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

export const insertMessageLogSchema = createInsertSchema(messageLogs).omit({
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

export type QRCode = typeof qrCodes.$inferSelect;
export type InsertQRCode = z.infer<typeof insertQRCodeSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type MessageLog = typeof messageLogs.$inferSelect;
export type InsertMessageLog = z.infer<typeof insertMessageLogSchema>;
