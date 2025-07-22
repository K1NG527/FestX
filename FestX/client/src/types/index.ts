export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  category: string;
  imageUrl?: string;
  organizerId: number;
  createdAt?: Date;
  registrationCount?: number;
}

export interface EventWithCount extends Event {
  registrationCount: number;
}

export interface Registration {
  id: number;
  userId: number;
  eventId: number;
  createdAt?: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
}
