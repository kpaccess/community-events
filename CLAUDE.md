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

Two variables are required (`.env.local` for local dev; Netlify dashboard for production):

```
NEXT_PUBLIC_SUPABASE_URL=https://bxcanynxlptvvapzjvun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Dashboard → Settings → API>
```

## Architecture

**Gather** is a Meetup.com-style events platform — Next.js 14 (App Router), MUI v5, Supabase for auth + database.

### Database (Supabase)

Schema is in `supabase/schema.sql`. Run it once in the Supabase SQL Editor. Three tables:

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users`; stores name, avatar initials, role (`admin`\|`member`) |
| `events` | All event fields; `created_by` → `profiles.id` |
| `rsvps` | Join table; unique on `(event_id, user_id)`; status `going`\|`declined` |

RLS is enabled on all tables. The `is_admin()` SQL function (in schema.sql) gates event write operations.

**To make a user admin:** after they sign up via the app, run in Supabase SQL editor:
```sql
update profiles set role = 'admin' where email = 'their@email.com';
```

### State & Data (`src/context/AppContext.jsx`)

All application state lives here. The Supabase client is in `src/lib/supabase.js`. The context exposes:
- Auth: `login`, `signup`, `logout` (all async, backed by `supabase.auth`)
- Events: `createEvent`, `updateEvent`, `deleteEvent` (admin-only, enforced by RLS)
- RSVP: `rsvpEvent(eventId, status)` — pass `null` to cancel an RSVP

DB rows are transformed on read: snake_case DB columns (`end_time`, `color_tag`, `created_by`) become camelCase in the app. The `rsvps` relation is fetched nested inside each event query and flattened into an `attendees` array.

### Routing (App Router)

| Route | Notes |
|---|---|
| `/` | Landing page |
| `/events` | Browse + filter events |
| `/events/[id]` | Event detail + RSVP |
| `/events/create` | Create event; `?edit={id}` pre-fills for editing |
| `/auth/login` | Login |
| `/auth/signup` | Signup |
| `/dashboard` | Admin-only stats + management |

Admin-only routes (`/dashboard`, `/events/create`) redirect non-admins away at the page level.

### Key Components

- `src/components/ClientLayout.jsx` — wraps the entire app with `AppProvider` + MUI `ThemeProvider`; rendered by `src/app/layout.jsx`
- `src/components/Navbar.jsx` — responsive nav with role-aware links and mobile drawer
- `src/components/EventCard.jsx` — reusable card used in browse and landing views

### Theme (`src/theme.js`)

MUI theme with:
- Primary: Indigo `#4F46E5`, Secondary: Amber `#F59E0B`
- Typography: Syne (headings) + DM Sans (body), loaded via Google Fonts in `globals.css`
- Component overrides: frosted-glass AppBar, gradient buttons, hover-transform cards

Path alias `@/*` → `./src/*` is configured in `jsconfig.json`.
