import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const EVENT_SELECT = `*, rsvps(user_id, status, profiles(name, avatar))`;

const ADMIN_ROLES = ['admin', 'super_admin'];

// Whitelist of fields accepted from the request body
const ALLOWED_FIELDS = new Set([
  'title', 'description', 'date', 'time', 'end_time',
  'location', 'address', 'category', 'capacity',
  'color_tag', 'tags', 'online',
]);

function pickAllowed(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_FIELDS.has(key))
  );
}

function validateEventBody(body: Record<string, unknown>): string | null {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) return 'title is required';
  if (typeof body.title === 'string' && body.title.length > 100) return 'title must be ≤ 100 characters';
  if (!body.date || typeof body.date !== 'string') return 'date is required';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date as string)) return 'date must be YYYY-MM-DD';
  if (body.capacity !== undefined) {
    const cap = Number(body.capacity);
    if (!Number.isInteger(cap) || cap < 1 || cap > 10000) return 'capacity must be an integer between 1 and 10000';
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationError = validateEventBody(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const safeBody = pickAllowed(body);

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({ ...safeBody, created_by: session.user.id })
    .select(EVENT_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
