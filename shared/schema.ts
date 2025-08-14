import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'event', 'dating', 'friendship'
  location: text("location").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  creatorId: integer("creator_id").notNull(),
  participants: text("participants").array().default([]),
  image: text("image"),
});

export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  action: text("action").notNull(), // 'like', 'pass'
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  eventId: integer("event_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  lastMessageId: integer("last_message_id"),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  bio: true,
  avatar: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  category: true,
  location: true,
  date: true,
  time: true,
  image: true,
}).extend({
  category: z.enum(["event", "dating", "friendship"]),
});

export const insertSwipeSchema = createInsertSchema(swipes).pick({
  eventId: true,
  action: true,
}).extend({
  action: z.enum(["like", "pass"]),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  eventId: true,
  content: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  eventId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
