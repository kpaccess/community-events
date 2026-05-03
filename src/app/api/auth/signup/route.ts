import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const avatar = name.trim().split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    name: name.trim(),
    email: email.toLowerCase(),
    role: 'member',
    bio: '',
    avatar,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: 'Failed to create profile.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
