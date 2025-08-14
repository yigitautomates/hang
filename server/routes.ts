import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertSwipeSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get events by category
  app.get("/api/events/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const events = await storage.getEventsByCategory(category);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events by category" });
    }
  });

  // Create a new event
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      // For demo purposes, use user ID 1 as creator
      const event = await storage.createEvent({ ...eventData, creatorId: 1 });
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  });

  // Create a swipe action
  app.post("/api/swipes", async (req, res) => {
    try {
      const swipeData = insertSwipeSchema.parse(req.body);
      // For demo purposes, use user ID 1
      const swipe = await storage.createSwipe({ ...swipeData, userId: 1 });
      
      // If it's a like, join the event and create/ensure conversation exists
      if (swipeData.action === "like") {
        await storage.joinEvent(swipeData.eventId, 1);
        
        // Check if conversation exists for this event, if not create one
        let conversation = await storage.getConversation(swipeData.eventId);
        if (!conversation) {
          conversation = await storage.createConversation({
            eventId: swipeData.eventId,
          });
        }
      }
      
      res.status(201).json(swipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid swipe data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create swipe" });
      }
    }
  });

  // Get user swipes
  app.get("/api/user/swipes", async (req, res) => {
    try {
      // For demo purposes, use user ID 1
      const swipes = await storage.getUserSwipes(1);
      res.json(swipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user swipes" });
    }
  });

  // Get user profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For demo purposes, use user ID 1
      const user = await storage.getUser(1);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Mesajlaşma API'leri
  // Get user conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      // For demo purposes, use user ID 1
      const conversations = await storage.getUserConversations(1);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get messages for a specific event
  app.get("/api/events/:eventId/messages", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const messages = await storage.getMessages(eventId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/events/:eventId/messages", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        eventId
      });
      
      // For demo purposes, use user ID 1
      const message = await storage.createMessage({ ...messageData, senderId: 1 });
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
