'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const AppContext = createContext(null);

// ─── Transforms ───────────────────────────────────────────────
const transformEvent = (e) => ({
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
  attendees: (e.rsvps || []).map(r => ({
    userId: r.user_id,
    name: r.profiles?.name || '',
    avatar: r.profiles?.avatar || '',
    status: r.status,
  })),
});

const toDbEvent = (data) => ({
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

const transformProfile = (p) => ({
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
export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(profile ? transformProfile(profile) : null);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchEvents, fetchUsers]);

  // ─── Auth ────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const avatar = name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name: name.trim(),
      email: email.toLowerCase(),
      role: 'member',
      bio: '',
      avatar,
    });

    if (profileError) return { success: false, error: 'Failed to create profile. Please try again.' };
    await fetchUsers();
    return { success: true };
  }, [fetchUsers]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ─── Events ──────────────────────────────────────────────────
  const createEvent = useCallback(async (data) => {
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({ ...toDbEvent(data), created_by: currentUser?.id })
      .select(EVENT_SELECT)
      .single();

    if (!error && newEvent) {
      const transformed = transformEvent(newEvent);
      setEvents(prev => [...prev, transformed].sort((a, b) => new Date(a.date) - new Date(b.date)));
      return transformed;
    }
    return null;
  }, [currentUser]);

  const updateEvent = useCallback(async (id, data) => {
    const { data: updated, error } = await supabase
      .from('events')
      .update(toDbEvent(data))
      .eq('id', id)
      .select(EVENT_SELECT)
      .single();

    if (!error && updated) {
      setEvents(prev => prev.map(e => e.id === id ? transformEvent(updated) : e));
    }
  }, []);

  const deleteEvent = useCallback(async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // ─── RSVP ────────────────────────────────────────────────────
  const rsvpEvent = useCallback(async (eventId, status) => {
    if (!currentUser) return;

    if (status === null) {
      await supabase.from('rsvps').delete().match({ event_id: eventId, user_id: currentUser.id });
    } else {
      await supabase.from('rsvps').upsert(
        { event_id: eventId, user_id: currentUser.id, status },
        { onConflict: 'event_id,user_id' }
      );
    }
    await fetchEvents();
  }, [currentUser, fetchEvents]);

  // ─── Helpers ─────────────────────────────────────────────────
  const getUserById = useCallback((id) => users.find(u => u.id === id), [users]);

  const getMyRsvp = useCallback((eventId) => {
    if (!currentUser) return null;
    const event = events.find(e => e.id === eventId);
    return event?.attendees?.find(a => a.userId === currentUser.id) || null;
  }, [currentUser, events]);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AppContext.Provider value={{
      currentUser, users, events, loading, isAdmin,
      login, signup, logout,
      createEvent, updateEvent, deleteEvent, rsvpEvent,
      getUserById, getMyRsvp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
