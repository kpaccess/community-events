# Gather – Community Events Platform

A Meetup.com-style community events platform built with **Next.js 14 (App Router)**, **MUI v5**, **Supabase** (database), and **NextAuth v4** (authentication).

## Features

| Feature             | Details                                           |
| ------------------- | ------------------------------------------------- |
| **Auth**            | Email/password, Google, and GitHub sign-in        |
| **Events**          | Create, edit, delete (admin only)                 |
| **RSVP**            | Members can mark Going / Can't Make It            |
| **Dashboard**       | Admin stats, events table, members list           |
| **Search & Filter** | Search by keyword, filter by category, sort       |
| **Responsive**      | Mobile-friendly with drawer nav                   |

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables** — create `.env.local` in the project root:

   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase Dashboard → Settings → API>
   SUPABASE_SERVICE_ROLE_KEY=<service role key from Supabase Dashboard → Settings → API>

   # NextAuth
   NEXTAUTH_SECRET=<random secret — generate with: openssl rand -base64 32>
   NEXTAUTH_URL=http://localhost:3000

   # OAuth providers (optional)
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GITHUB_ID=
   GITHUB_SECRET=
   ```

3. **Apply the database schema** — run `supabase/schema.sql` in the Supabase SQL editor.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing / Home
│   ├── layout.tsx
│   ├── globals.css
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/      # NextAuth handler
│   │   │   └── signup/             # POST: create account
│   │   ├── events/
│   │   │   ├── route.ts            # GET list / POST create
│   │   │   └── [id]/route.ts       # GET / PATCH / DELETE
│   │   ├── rsvps/route.ts          # POST / DELETE
│   │   └── users/[id]/route.ts     # PATCH (role, profile)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── events/
│   │   ├── page.tsx                # Browse events (search + filter)
│   │   ├── [id]/page.tsx           # Event detail + RSVP
│   │   └── create/page.tsx         # Create / Edit event (admin)
│   └── dashboard/page.tsx          # Admin dashboard
├── components/
│   ├── ClientLayout.tsx            # ThemeProvider + AppProvider wrapper
│   ├── Navbar.tsx                  # Top nav (role-aware)
│   └── EventCard.tsx               # Reusable event card
├── context/
│   └── AppContext.tsx              # Global state (session + events + users)
├── lib/
│   ├── auth.ts                     # NextAuth config (providers, callbacks)
│   ├── supabase.ts                 # Anon client (client-side reads)
│   └── supabase-admin.ts           # Service role client (API routes only)
├── types/
│   ├── index.ts
│   ├── global.d.ts                 # NextAuth Session/JWT type extensions
│   └── next-auth.d.ts
└── theme.ts                        # MUI theme (Syne + DM Sans, indigo/amber)
```

## Architecture

**Read path:** `AppContext` fetches events and profiles directly from Supabase using the anon client on mount.

**Write path:** All mutations go through Next.js API routes (`/api/events`, `/api/rsvps`, etc.), which use the service role client and verify the session server-side.

**Auth:** NextAuth v4 with JWT sessions. The JWT and session callbacks enrich the token with `role`, `avatar`, `bio`, and `joinedAt` from `profiles`. OAuth sign-ins auto-create a `profiles` row on first login. Email sign-up hits `POST /api/auth/signup`.

## Database (Supabase)

Schema is in `supabase/schema.sql`. Three tables:

| Table      | Purpose                                                         |
| ---------- | --------------------------------------------------------------- |
| `profiles` | Name, avatar initials, role (`admin`\|`member`), bio           |
| `events`   | All event fields; `created_by` → `profiles.id`                 |
| `rsvps`    | Join table; unique on `(event_id, user_id)`; status `going`\|`declined` |

RLS is enabled on all tables. The `is_admin()` SQL function gates event writes; API routes also enforce `role === 'admin'` in the session.

## User Roles

| Role       | Permissions                                                           |
| ---------- | --------------------------------------------------------------------- |
| **admin**  | Create / edit / delete events, view dashboard, all member permissions |
| **member** | Browse events, RSVP (Going / Decline), view event details             |

New signups are assigned the `member` role by default.

## Making a User Admin

After they sign up via the app, run in the Supabase SQL editor:

```sql
update profiles set role = 'admin' where email = 'their@email.com';
```

They must log out and back in for the change to take effect.

## Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Framework     | Next.js 14 (App Router)                 |
| UI            | MUI v5                                  |
| Auth          | NextAuth v4 (Credentials, Google, GitHub) |
| Database      | Supabase (PostgreSQL)                   |
| Language      | TypeScript                              |
| Fonts         | Syne (headings) + DM Sans (body)        |
| State         | React Context + Supabase                |
