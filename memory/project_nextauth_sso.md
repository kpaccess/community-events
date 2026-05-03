---
name: NextAuth SSO architecture
description: Auth layer migrated from Supabase Auth to NextAuth v4 with Google, GitHub, and Credentials providers
type: project
---

NextAuth v4 added on top of existing Supabase DB setup for SSO (Google + GitHub) plus email/password via CredentialsProvider.

**Why:** User wanted SSO support. Supabase RLS uses `auth.uid()` which only works with Supabase Auth sessions, so Supabase Auth is kept for email/password validation while NextAuth manages all sessions.

**How to apply:**
- `src/lib/auth.ts` — NextAuth config (authOptions); import here for `getServerSession` calls
- `src/lib/supabase-admin.ts` — service role client; all mutation API routes use this to bypass RLS
- DB reads still use the anon Supabase client directly (public RLS policies allow it)
- DB writes (events, rsvps, profile creation) go through API routes at `/api/events`, `/api/events/[id]`, `/api/rsvps`, `/api/auth/signup`
- AppContext uses `useSession` from next-auth/react; `currentUser` is derived from session
- `SessionProvider` wraps the app in `ClientLayout.tsx`
- OAuth users get Supabase `profiles` rows created in the NextAuth `signIn` callback using service role
- Email/password users: Supabase Auth still holds credentials; CredentialsProvider validates against it

**Env vars still needed in .env.local:**
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Dashboard → Settings → API
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — e.g. `http://localhost:3000`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `GITHUB_ID` / `GITHUB_SECRET` — from GitHub OAuth Apps settings
