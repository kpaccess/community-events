import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES = new Set(['going', 'declined']);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { eventId?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { eventId, status } = body;

  if (!eventId || typeof eventId !== 'string' || !UUID_RE.test(eventId)) {
    return NextResponse.json({ error: 'Invalid or missing eventId' }, { status: 400 });
  }

  if (!status || typeof status !== 'string' || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'status must be "going" or "declined"' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('rsvps')
    .upsert(
      { event_id: eventId, user_id: session.user.id, status },
      { onConflict: 'event_id,user_id' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');

  if (!eventId || !UUID_RE.test(eventId)) {
    return NextResponse.json({ error: 'Invalid or missing eventId' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('rsvps')
    .delete()
    .match({ event_id: eventId, user_id: session.user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
