# Gather – Community Events Platform

A Meetup.com-style community events platform built with **Next.js 14 (App Router)**, **MUI v5**, and localStorage for data persistence. No backend required to run.

## Features

| Feature | Details |
|---|---|
| **Auth** | Signup, login, logout with roles (admin / member) |
| **Events** | Create, edit, delete (admin only) |
| **RSVP** | Members can mark Going / Can't Make It |
| **Dashboard** | Admin stats, events table, members list |
| **Search & Filter** | Search by keyword, filter by category, sort |
| **Responsive** | Mobile-friendly with drawer nav |

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Admin Login

```
Email:    admin@gather.com
Password: admin123
```

> The admin account is pre-seeded. Any new signups become **members**.

## Project Structure

```
src/
├── app/
│   ├── page.jsx              # Landing / Home
│   ├── auth/
│   │   ├── login/page.jsx    # Login
│   │   └── signup/page.jsx   # Signup
│   ├── events/
│   │   ├── page.jsx          # Browse events (search + filter)
│   │   ├── [id]/page.jsx     # Event detail + RSVP
│   │   └── create/page.jsx   # Create/Edit event (admin)
│   └── dashboard/page.jsx    # Admin dashboard
├── components/
│   ├── ClientLayout.jsx      # ThemeProvider + AppProvider wrapper
│   ├── Navbar.jsx            # Top nav (auth-aware)
│   └── EventCard.jsx         # Reusable event card
├── context/
│   └── AppContext.jsx        # Global state (auth + events + users)
└── theme.js                  # MUI theme (Syne + DM Sans, indigo/amber)
```

## Data Layer

All data is stored in **localStorage** under these keys:

| Key | Contents |
|---|---|
| `cm_users` | Array of user objects |
| `cm_events` | Array of event objects |
| `cm_currentUser` | Currently logged-in user |

To reset all data: open DevTools → Application → Local Storage → delete all `cm_*` keys and refresh.

## User Roles

| Role | Permissions |
|---|---|
| **admin** | Create / edit / delete events, view dashboard, all member permissions |
| **member** | Browse events, RSVP (Going / Decline), view event details |

## Making Yourself Admin

To promote a signed-up user to admin, open DevTools Console:

```js
const users = JSON.parse(localStorage.getItem('cm_users'));
const updated = users.map(u => u.email === 'you@email.com' ? {...u, role: 'admin'} : u);
localStorage.setItem('cm_users', JSON.stringify(updated));
// Then log out and log back in
```

## Adding a Second Admin

Same method as above — just change the target email to the other admin's email.

## Upgrading to a Real Backend

The `AppContext.jsx` actions (`login`, `signup`, `createEvent`, etc.) are the integration points. Replace the localStorage calls with `fetch()` calls to your API (e.g. Next.js API routes + Prisma + PostgreSQL).

Recommended stack for production:
- **Auth**: NextAuth.js or Clerk
- **DB**: PostgreSQL with Prisma ORM  
- **Hosting**: Vercel (Next.js native)
- **Images**: Cloudinary or Vercel Blob

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: MUI v5
- **Fonts**: Syne (headings) + DM Sans (body) via Google Fonts
- **State**: React Context + localStorage
- **Language**: JavaScript (JSX)
