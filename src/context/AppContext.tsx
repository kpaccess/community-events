'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import type { AppContextType, Attendee, Event, User, RsvpStatus } from '@/types';

const AppContext = createContext<AppContextType | null>(null);

// ─── Transforms ───────────────────────────────────────────────
const transformEvent = (e: Record<string, any>): Event => ({
  id: e.id,
  title: e.title,
  description: e.description,
  date: e.date,
  time: e.time,
  endTime: e.end_time,
  location: e.location,
  address: e.address,
  category: e.category,
  capacity: e.capacity,
  colorTag: e.color_tag,
  tags: e.tags || [],
  createdBy: e.created_by,
  createdAt: e.created_at,
  online: e.online || false,
  attendees: (e.rsvps || []).map((r: Record<string, any>): Attendee => ({
    userId: r.user_id,
    name: r.profiles?.name || '',
    avatar: r.profiles?.avatar || '',
    status: r.status,
  })),
});

const toDbEvent = (data: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'attendees'>) => ({
  title: data.title,
  description: data.description,
  date: data.date,
  time: data.time,
  end_time: data.endTime,
  location: data.location,
  address: data.address,
  category: data.category,
  capacity: Number(data.capacity),
  color_tag: data.colorTag,
  tags: data.tags || [],
  online: data.online || false,
});

const transformProfile = (p: Record<string, any>): User => ({
  id: p.id,
  name: p.name,
  email: p.email,
  role: p.role,
  bio: p.bio || '',
  avatar: p.avatar || '',
  joinedAt: p.joined_at,
});

const EVENT_SELECT = `*, rsvps(user_id, status, profiles(name, avatar))`;

// ─── Provider ──────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const loading = status === 'loading';

  const currentUser: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        role: session.user.role,
        bio: session.user.bio,
        avatar: session.user.avatar,
        joinedAt: session.user.joinedAt,
      }
    : null;

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select(EVENT_SELECT)
      .order('date', { ascending: true });
    if (data) setEvents(data.map(transformEvent));
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('joined_at', { ascending: true });
    if (data) setUsers(data.map(transformProfile));
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, [fetchEvents, fetchUsers]);

  // ─── Auth ────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', { email, password, redirect: false });
    if (result?.error || !result?.ok) {
      return { success: false, error: 'Invalid email or password.' };
    }
    return { success: true };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: body.error ?? 'Signup failed.' };
    }

    const result = await nextAuthSignIn('credentials', { email, password, redirect: false });
    if (result?.error || !result?.ok) {
      return { success: false, error: 'Account created. Please sign in.' };
    }

    await fetchUsers();
    return { success: true };
  }, [fetchUsers]);

  const logout = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
  }, []);

  // ─── Events ──────────────────────────────────────────────────
  const createEvent = useCallback(async (data: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'attendees'>) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toDbEvent(data)),
    });
    if (!res.ok) return null;
    const newEvent = await res.json();
    const transformed = transformEvent(newEvent);
    setEvents(prev => [...prev, transformed].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    return transformed;
  }, []);

  const updateEvent = useCallback(async (id: string, data: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'attendees'>) => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toDbEvent(data)),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setEvents(prev => prev.map(e => e.id === id ? transformEvent(updated) : e));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // ─── RSVP ────────────────────────────────────────────────────
  const rsvpEvent = useCallback(async (eventId: string, status: RsvpStatus | null) => {
    if (!currentUser) return;

    if (status === null) {
      await fetch(`/api/rsvps?eventId=${eventId}`, { method: 'DELETE' });
    } else {
      await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status }),
      });
    }
    await fetchEvents();
  }, [currentUser, fetchEvents]);

  // ─── Helpers ─────────────────────────────────────────────────
  const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);

  const getMyRsvp = useCallback((eventId: string): Attendee | null => {
    if (!currentUser) return null;
    const event = events.find(e => e.id === eventId);
    return event?.attendees?.find(a => a.userId === currentUser.id) ?? null;
  }, [currentUser, events]);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;

  // ─── User Role Management ────────────────────────────────────
  const updateUserRole = useCallback(async (userId: string, role: 'admin' | 'member') => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: body.error ?? 'Failed to update role.' };
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    return { success: true };
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, users, events, loading, isAdmin, isSuperAdmin,
      login, signup, logout,
      createEvent, updateEvent, deleteEvent, rsvpEvent, updateUserRole,
      getUserById, getMyRsvp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
