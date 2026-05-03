import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId, status } = await req.json();
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
  if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('rsvps')
    .delete()
    .match({ event_id: eventId, user_id: session.user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
