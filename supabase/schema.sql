-- ================================================================
-- Gather – Supabase Schema
-- Run this entire file in the Supabase SQL Editor:
--   Dashboard → SQL Editor → New query → paste → Run
--
-- Before running:
--   • In Supabase Dashboard → Authentication → Providers → Email,
--     disable "Confirm email" so users can log in immediately.
--
-- After running:
--   • Sign up via the app, then promote yourself to admin:
--       update profiles set role = 'admin' where email = 'your@email.com';
-- ================================================================

-- ── Profiles (extends auth.users) ────────────────────────────
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  name      text not null,
  email     text not null,
  role      text not null default 'member' check (role in ('admin', 'member')),
  bio       text default '',
  avatar    text default '',
  joined_at timestamptz default now()
);

-- ── Events ───────────────────────────────────────────────────
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  date        date not null,
  time        text,
  end_time    text,
  location    text,
  address     text,
  category    text,
  capacity    integer default 50,
  color_tag   text default '#4F46E5',
  tags        text[] default '{}',
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now(),
  online      boolean default false
);

-- ── RSVPs ────────────────────────────────────────────────────
create table if not exists rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  status     text not null check (status in ('going', 'declined')),
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

-- ── Row Level Security ────────────────────────────────────────
alter table profiles enable row level security;
alter table events    enable row level security;
alter table rsvps     enable row level security;

create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: public read; own row insert/update
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (id = auth.uid());
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- events: public read; admin write
create policy "events_read"   on events for select using (true);
create policy "events_insert" on events for insert with check (is_admin());
create policy "events_update" on events for update using (is_admin());
create policy "events_delete" on events for delete using (is_admin());

-- rsvps: public read; own row write
create policy "rsvps_read"   on rsvps for select using (true);
create policy "rsvps_insert" on rsvps for insert with check (user_id = auth.uid());
create policy "rsvps_update" on rsvps for update using (user_id = auth.uid());
create policy "rsvps_delete" on rsvps for delete using (user_id = auth.uid());
