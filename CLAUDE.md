# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

No test framework is configured.

## Environment variables

Required in `.env.local` for local dev:

```
# Supabase (client-side reads)
NEXT_PUBLIC_SUPABASE_URL=https://bxcanynxlptvvapzjvun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Dashboard → Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard → Settings → API>

# NextAuth
NEXTAUTH_SECRET=<random secret, e.g. openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# OAuth providers (optional — only needed if using Google/GitHub login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
```

## Architecture

**Gather** is a Meetup.com-style events platform — Next.js 14 (App Router), MUI v5, Supabase for the database, NextAuth v4 for authentication.

### Auth layer (NextAuth + Supabase)

Auth is handled by **NextAuth v4** (`src/lib/auth.ts`), not Supabase Auth sessions. Three providers: email/password (Credentials), Google, and GitHub. Sessions use the JWT strategy; the JWT and session callbacks enrich the token with `role`, `avatar`, `bio`, and `joinedAt` fetched from `profiles`.

- OAuth sign-ins auto-create a `profiles` row on first login (via the `signIn` callback).
- Email sign-up hits `POST /api/auth/signup`, which uses the Supabase admin client to create the Supabase auth user, then immediately signs in via NextAuth credentials.
- `src/types/global.d.ts` extends the NextAuth `Session` and `JWT` types to include the custom fields.

### Two Supabase clients

| Client | File | Key used | Where used |
|---|---|---|---|
| `supabase` | `src/lib/supabase.ts` | anon key | Client-side reads in `AppContext` |
| `supabaseAdmin` | `src/lib/supabase-admin.ts` | service role key | Server-side only: API routes, NextAuth callbacks |

`supabaseAdmin` is a lazy Proxy — it initializes the real client on first access to avoid errors during build when env vars may be absent.

### State & Data (`src/context/AppContext.tsx`)

All client-side state lives here (session from `useSession`, plus `events` and `users` fetched from Supabase on mount). The context exposes:
- Auth: `login`, `signup`, `logout`
- Events: `createEvent`, `updateEvent`, `deleteEvent` — these call API routes, not Supabase directly
- RSVP: `rsvpEvent(eventId, status)` — pass `null` to cancel; calls API routes
- Helpers: `getUserById`, `getMyRsvp`

**Read path:** `AppContext` fetches `events` and `profiles` directly via the anon Supabase client.  
**Write path:** All mutations go through Next.js API routes (`/api/events`, `/api/events/[id]`, `/api/rsvps`) which use `supabaseAdmin` and verify session + admin role server-side.

DB rows are transformed on read: snake_case columns (`end_time`, `color_tag`, `created_by`) become camelCase. The `rsvps` relation is fetched nested via `*, rsvps(user_id, status, profiles(name, avatar))` and flattened into an `attendees` array on each event.

### Database (Supabase)

Schema is in `supabase/schema.sql`. Three tables:

| Table | Purpose |
|---|---|
| `profiles` | Stores name, avatar initials, role (`admin`\|`member`), bio |
| `events` | All event fields; `created_by` → `profiles.id` |
| `rsvps` | Join table; unique on `(event_id, user_id)`; status `going`\|`declined` |

RLS is enabled on all tables. The `is_admin()` SQL function gates event write operations, but the API routes also enforce `role === 'admin'` in the session.

**To make a user admin:** after they sign up via the app, run in Supabase SQL editor:
```sql
update profiles set role = 'admin' where email = 'their@email.com';
```

### Routing (App Router)

| Route | Notes |
|---|---|
| `/` | Landing page |
| `/events` | Browse + filter events |
| `/events/[id]` | Event detail + RSVP |
| `/events/create` | Create event; `?edit={id}` pre-fills for editing |
| `/auth/login` | Login (NextAuth `signIn` page) |
| `/auth/signup` | Signup |
| `/dashboard` | Admin-only stats + management |

Admin-only routes (`/dashboard`, `/events/create`) redirect non-admins away at the page level.

### Key Components

- `src/components/ClientLayout.tsx` — wraps the entire app with `AppProvider` + MUI `ThemeProvider`; rendered by `src/app/layout.tsx`
- `src/components/Navbar.tsx` — responsive nav with role-aware links and mobile drawer
- `src/components/EventCard.tsx` — reusable card used in browse and landing views

### Theme (`src/theme.ts`)

MUI theme with:
- Primary: Indigo `#4F46E5`, Secondary: Amber `#F59E0B`
- Typography: Syne (headings) + DM Sans (body), loaded via Google Fonts in `globals.css`
- Component overrides: frosted-glass AppBar, gradient buttons, hover-transform cards

Path alias `@/*` → `./src/*` is configured in `jsconfig.json`.
