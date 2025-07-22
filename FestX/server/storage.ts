import { 
  Event,
  InsertEvent,
  Registration,
  InsertRegistration,
  User,
  InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByCategory(category: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  searchEvents(query: string): Promise<Event[]>;
  
  // Registration methods
  getRegistrations(eventId: number): Promise<Registration[]>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  getRegistration(userId: number, eventId: number): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(userId: number, eventId: number): Promise<boolean>;
  getRegistrationCount(eventId: number): Promise<number>;
  getUserEvents(userId: number): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private registrations: Map<number, Registration>;
  private userId: number;
  private eventId: number;
  private registrationId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.registrations = new Map();
    this.userId = 1;
    this.eventId = 1;
    this.registrationId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.category === category
    ).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const now = new Date();
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: now,
      imageUrl: insertEvent.imageUrl || null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  async searchEvents(query: string): Promise<Event[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.events.values()).filter(
      (event) => 
        event.title.toLowerCase().includes(lowercaseQuery) || 
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.location.toLowerCase().includes(lowercaseQuery) ||
        event.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Registration methods
  async getRegistrations(eventId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.eventId === eventId
    );
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.userId === userId
    );
  }

  async getRegistration(userId: number, eventId: number): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (registration) => registration.userId === userId && registration.eventId === eventId
    );
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.registrationId++;
    const now = new Date();
    const registration: Registration = { 
      ...insertRegistration, 
      id, 
      createdAt: now
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async deleteRegistration(userId: number, eventId: number): Promise<boolean> {
    const registration = Array.from(this.registrations.values()).find(
      (r) => r.userId === userId && r.eventId === eventId
    );
    if (!registration) return false;
    return this.registrations.delete(registration.id);
  }

  async getRegistrationCount(eventId: number): Promise<number> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.eventId === eventId
    ).length;
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    const registrations = await this.getRegistrationsByUser(userId);
    const eventIds = registrations.map((registration) => registration.eventId);
    return Array.from(this.events.values()).filter(
      (event) => eventIds.includes(event.id)
    );
  }

  // Helper to initialize sample data
  private initSampleData() {
    // Create sample user
    const user: InsertUser = {
      username: "admin",
      password: "password123",
      email: "admin@university.edu"
    };
    this.createUser(user);

    // Sample events based on the design reference
    const sampleEvents: InsertEvent[] = [
      {
        title: "Annual Tech Symposium",
        description: "Join industry leaders and researchers for our annual technology symposium featuring keynotes, panel discussions, and networking.",
        date: "2023-11-15",
        startTime: "09:00",
        endTime: "17:00",
        location: "Main Auditorium",
        capacity: 200,
        category: "academic",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        organizerId: 1
      },
      {
        title: "Campus Spring Festival",
        description: "Celebrate the season with food, music, games, and performances from student organizations across campus.",
        date: "2023-11-20",
        startTime: "11:00",
        endTime: "20:00",
        location: "Campus Green",
        capacity: 500,
        category: "social",
        imageUrl: "https://images.unsplash.com/photo-1560523159-4a9692d222f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        organizerId: 1
      },
      {
        title: "Fall Career Fair",
        description: "Connect with 50+ employers recruiting for internships and full-time positions. Bring your resume and professional attire.",
        date: "2023-11-25",
        startTime: "10:00",
        endTime: "15:00",
        location: "Student Union",
        capacity: 200,
        category: "career",
        imageUrl: "https://images.unsplash.com/photo-1559223607-a43c990c692c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        organizerId: 1
      },
      {
        title: "Research Symposium",
        description: "Undergraduate and graduate students showcase their research projects across disciplines with faculty judges and prizes.",
        date: "2023-11-30",
        startTime: "13:00",
        endTime: "18:00",
        location: "Science Building",
        capacity: 100,
        category: "academic",
        imageUrl: "https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        organizerId: 1
      },
      {
        title: "Intramural Basketball",
        description: "Form a team of 5-7 players or sign up individually to be matched with a team for our winter basketball tournament.",
        date: "2023-12-05",
        startTime: "14:00",
        endTime: "20:00",
        location: "Sports Complex",
        capacity: 80,
        category: "sports",
        imageUrl: "https://images.unsplash.com/photo-1569683795546-bf1ca0a8696a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        organizerId: 1
      },
      {
        title: "Leadership Workshop",
        description: "Develop essential leadership skills through interactive exercises and insights from successful alumni leaders.",
        date: "2023-12-10",
        startTime: "15:30",
        endTime: "17:30",
        location: "Business Building, Room 204",
        capacity: 35,
        category: "workshop",
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80",
        organizerId: 1
      }
    ];

    // Create the events
    sampleEvents.forEach(event => {
      this.createEvent(event);
    });

    // Add some registrations
    this.createRegistration({ userId: 1, eventId: 1 });
    this.createRegistration({ userId: 1, eventId: 3 });
  }
}

export const storage = new MemStorage();
