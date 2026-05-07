import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden: super_admin only' }, { status: 403 });
  }

  const targetId = params.id;

  if (!UUID_RE.test(targetId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // Prevent modifying yourself
  if (session.user.id === targetId) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }

  // Fetch the target user to ensure they exist and are not a super_admin
  const { data: target, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, email')
    .eq('id', targetId)
    .single();

  if (fetchError || !target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (target.role === 'super_admin') {
    return NextResponse.json({ error: 'Cannot modify a super admin' }, { status: 400 });
  }

  let body: { role?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { role } = body;

  if (typeof role !== 'string' || !['admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be admin or member.' }, { status: 400 });
  }

  const safeRole = role as 'admin' | 'member';

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ role: safeRole })
    .eq('id', targetId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: targetId, role: safeRole });
}
