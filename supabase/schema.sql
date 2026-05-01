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

-- ── Seed Events ──────────────────────────────────────────────
insert into events (title, description, date, time, end_time, location, address, category, capacity, color_tag, tags, online)
values
  (
    'React & Next.js Builders Meetup',
    E'Join us for an evening of React and Next.js discussions, live coding demos, and networking with fellow developers.\n\nTopics:\n• App Router deep dive & Server Components\n• Latest MUI v5 theming patterns\n• Performance optimization tips\n• Q&A with local tech leads\n\nAll skill levels welcome. Bring your laptop if you want to code along!',
    '2026-05-20', '18:30', '21:00',
    'Industrious Coworking – Nashville', '150 4th Ave N, Nashville, TN 37219',
    'Technology', 50, '#4F46E5', array['React','Next.js','TypeScript','MUI'], false
  ),
  (
    'AI & Automation Workshop',
    E'Hands-on workshop exploring n8n workflows, Claude API integrations, and building agentic pipelines.\n\nWhat you''ll learn:\n• n8n workflow fundamentals\n• Connecting LLM APIs to real workflows\n• Real estate & short-term rental automation use cases\n• Building your first AI agent\n\nBring your laptop! Seats are limited to keep sessions interactive.',
    '2026-06-05', '10:00', '14:00',
    'WeWork Downtown Nashville', '500 Church St, Nashville, TN 37219',
    'AI & Machine Learning', 30, '#F59E0B', array['AI','Automation','n8n','Claude API'], false
  ),
  (
    'Frontend Design Systems Deep Dive',
    E'Virtual deep dive into advanced MUI theming, design tokens with Style Dictionary, and Figma-to-code workflows.\n\nAgenda:\n• Design token architecture\n• MUI theme customization at scale\n• Figma MCP server demo\n• Component library patterns for large teams\n• Live Q&A\n\nAll attendees get access to the recorded session.',
    '2026-06-18', '19:00', '21:30',
    'Online – Zoom', 'Online',
    'Design', 100, '#EC4899', array['MUI','Design Systems','Figma','Design Tokens'], true
  ),
  (
    'GraphQL & API Design Patterns',
    E'Deep dive into GraphQL schema design, performance optimization, and API best practices used at scale.\n\nTopics covered:\n• Schema-first design principles\n• DataLoader & batching strategies\n• Apollo Client caching patterns\n• REST vs GraphQL vs tRPC decision guide\n\nPerfect for backend and full-stack developers.',
    '2026-07-10', '18:00', '20:30',
    'Brentwood Public Library – Community Room', '8109 Concord Rd, Brentwood, TN 37027',
    'Technology', 40, '#10B981', array['GraphQL','API','Apollo','Backend'], false
  );
