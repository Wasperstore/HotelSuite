import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
// Note: This file uses .js extension but imports .ts files via tsx runtime
import { users, hotels, rooms, qrCodes, payments, messageLogs } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  console.log("🌱 Starting database seeding...");

  try {
    // Check if super admin already exists
    const existingSuperAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "wasperstore@gmail.com"));

    if (existingSuperAdmin.length === 0) {
      // Create super admin user
      const hashedPassword = await hashPassword("Azeezwosilat1986@");
      
      const [superAdmin] = await db
        .insert(users)
        .values({
          email: "wasperstore@gmail.com",
          username: "wasperstore",
          fullName: "Super Administrator",
          passwordHash: hashedPassword,
          role: "SUPER_ADMIN",
          forcePasswordReset: false
        })
        .returning();
      
      console.log("✅ Super admin user created:", superAdmin.email);
    } else {
      console.log("ℹ️  Super admin user already exists");
    }

    // Create example hotel owner
    let hotelOwner;
    const existingOwner = await db
      .select()
      .from(users)
      .where(eq(users.email, "owner@example.com"));

    if (existingOwner.length === 0) {
      const ownerPassword = await hashPassword("password123");
      
      [hotelOwner] = await db
        .insert(users)
        .values({
          email: "owner@example.com",
          username: "exampleowner",
          fullName: "Example Hotel Owner",
          passwordHash: ownerPassword,
          role: "HOTEL_OWNER",
          forcePasswordReset: true
        })
        .returning();
      
      console.log("✅ Example hotel owner created:", hotelOwner.email);
    } else {
      hotelOwner = existingOwner[0];
      console.log("ℹ️  Example hotel owner already exists");
    }

    // Create example hotel
    const existingHotel = await db
      .select()
      .from(hotels)
      .where(eq(hotels.slug, "example-luxury-hotel"));

    if (existingHotel.length === 0) {
      const [hotel] = await db
        .insert(hotels)
        .values({
          name: "Example Luxury Hotel",
          slug: "example-luxury-hotel",
          ownerId: hotelOwner.id,
          status: "active"
        })
        .returning();
      
      // Update the hotel owner with the hotel ID
      await db
        .update(users)
        .set({ hotelId: hotel.id })
        .where(eq(users.id, hotelOwner.id));
      
      console.log("✅ Example hotel created:", hotel.name);

      // Create example rooms
      const roomsData = [
        { number: "101", type: "Standard", label: "Standard Room with Garden View" },
        { number: "102", type: "Standard", label: "Standard Room with Pool View" },
        { number: "201", type: "Deluxe", label: "Deluxe Room with Balcony" },
        { number: "301", type: "Suite", label: "Presidential Suite" }
      ];

      for (const roomData of roomsData) {
        await db
          .insert(rooms)
          .values({
            hotelId: hotel.id,
            ...roomData,
            status: "available"
          });
      }
      
      console.log(`✅ Created ${roomsData.length} example rooms`);
    } else {
      console.log("ℹ️  Example hotel already exists");
    }

    console.log("🎉 Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();