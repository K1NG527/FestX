import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Event Categories
export const EVENT_CATEGORIES = [
  "academic",
  "social",
  "career",
  "sports",
  "workshop",
  "conference"
] as const;

// Events Table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(), // storing as YYYY-MM-DD string
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  organizerId: integer("organizer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Registrations Table
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

// Insert schemas
export const insertEventSchema = createInsertSchema(events)
  .omit({ id: true, createdAt: true })
  .extend({
    category: z.enum(EVENT_CATEGORIES),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    capacity: z.number().int().positive("Capacity must be a positive number"),
  });

export const insertRegistrationSchema = createInsertSchema(registrations)
  .omit({ id: true, createdAt: true });

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({
    email: z.string().email("Please enter a valid email"),
  });

// Types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
