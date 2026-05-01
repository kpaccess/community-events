export interface Attendee {
  userId: string;
  name: string;
  avatar: string;
  status: 'going' | 'declined';
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  endTime: string | null;
  location: string | null;
  address: string | null;
  category: string | null;
  capacity: number;
  colorTag: string;
  tags: string[];
  createdBy: string | null;
  createdAt: string;
  online: boolean;
  attendees: Attendee[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  bio: string;
  avatar: string;
  joinedAt: string;
}

export type RsvpStatus = 'going' | 'declined';

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  events: Event[];
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createEvent: (data: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'attendees'>) => Promise<Event | null>;
  updateEvent: (id: string, data: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'attendees'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  rsvpEvent: (eventId: string, status: RsvpStatus | null) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  getMyRsvp: (eventId: string) => Attendee | null;
}
