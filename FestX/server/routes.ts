import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertEventSchema, 
  insertRegistrationSchema, 
  insertUserSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for zod validation errors
  const handleZodError = (error: unknown) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return {
        message: validationError.message,
        errors: error.errors
      };
    }
    return { message: String(error) };
  };

  // GET all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // GET events by category
  app.get("/api/events/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const events = await storage.getEventsByCategory(category);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events by category" });
    }
  });

  // GET event by id
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const registrationCount = await storage.getRegistrationCount(id);
      res.json({ ...event, registrationCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // POST create event
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      const errorResponse = handleZodError(error);
      res.status(400).json(errorResponse);
    }
  });

  // PUT update event
  app.put("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const eventData = insertEventSchema.parse(req.body);
      const updatedEvent = await storage.updateEvent(id, eventData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      const errorResponse = handleZodError(error);
      res.status(400).json(errorResponse);
    }
  });

  // DELETE event
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Search events
  app.get("/api/events/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const events = await storage.searchEvents(query);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to search events" });
    }
  });

  // GET registration count for event
  app.get("/api/events/:id/registrations/count", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const count = await storage.getRegistrationCount(id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get registration count" });
    }
  });

  // GET all user's registrations
  app.get("/api/users/:userId/registrations", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const registrations = await storage.getRegistrationsByUser(userId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user registrations" });
    }
  });

  // GET user's registered events
  app.get("/api/users/:userId/events", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  // POST register for event
  app.post("/api/registrations", async (req, res) => {
    try {
      const registrationData = insertRegistrationSchema.parse(req.body);
      
      // Check if event exists
      const event = await storage.getEvent(registrationData.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(registrationData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if already registered
      const existingRegistration = await storage.getRegistration(
        registrationData.userId,
        registrationData.eventId
      );
      
      if (existingRegistration) {
        return res.status(400).json({ message: "User already registered for this event" });
      }
      
      // Check if event is at capacity
      const registrationCount = await storage.getRegistrationCount(registrationData.eventId);
      if (registrationCount >= event.capacity) {
        return res.status(400).json({ message: "Event is at full capacity" });
      }
      
      const registration = await storage.createRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      const errorResponse = handleZodError(error);
      res.status(400).json(errorResponse);
    }
  });

  // DELETE cancel registration
  app.delete("/api/registrations/:userId/:eventId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(userId) || isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid user ID or event ID" });
      }

      const success = await storage.deleteRegistration(userId, eventId);
      if (!success) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json({ message: "Registration cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel registration" });
    }
  });

  // POST create user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      const errorResponse = handleZodError(error);
      res.status(400).json(errorResponse);
    }
  });

  // Login user (simulated for demo)
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
