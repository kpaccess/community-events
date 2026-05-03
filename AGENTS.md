# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 14 App Router application written in TypeScript. Route pages and API handlers live in `src/app/`, including `/events`, `/dashboard`, `/auth/*`, and API routes under `src/app/api/`. Shared UI components are in `src/components/`, application state is in `src/context/AppContext.tsx`, Supabase clients and auth helpers are in `src/lib/`, and shared types are in `src/types/`. Global styles are in `src/app/globals.css`; the MUI theme is defined in `src/theme.ts`. Database schema and RLS policies are maintained in `supabase/schema.sql`. Project notes live in `memory/`.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the local Next.js dev server at `http://localhost:3000`.
- `npm run build` creates a production build and runs TypeScript/Next.js checks.
- `npm start` serves the production build after `npm run build`.
- `npm run lint` runs the configured Next.js ESLint checks.

## Coding Style & Naming Conventions

Use TypeScript for new code: `.tsx` for React components/pages and `.ts` for utilities, types, and server helpers. Prefer the `@/*` path alias for imports from `src/`. Components and context providers use PascalCase, hooks and functions use camelCase, and route folder names follow Next.js conventions such as `[id]`. Keep app-facing models camelCase and convert Supabase snake_case fields at the data boundary, as done in `AppContext.tsx`. Follow existing formatting: two-space indentation, single quotes, semicolons, and MUI `sx` styling for component-level styles.

## Testing Guidelines

No automated test framework is currently configured. Before submitting changes, run `npm run lint` and `npm run build`. For user-facing changes, manually verify the affected route in the browser, including signed-out, member, and admin flows when relevant. If tests are added later, colocate them near the code they cover or use a clear `src/**/__tests__/` pattern, and document the new command here.

## Commit & Pull Request Guidelines

The current history uses concise, imperative commit subjects, for example `Convert codebase from JSX to TypeScript (TSX/TS)`. Keep commits focused and descriptive. Pull requests should include a short summary, linked issue or task when available, test/build results, and screenshots for visual UI changes. Call out database, auth, or environment-variable changes explicitly.

## Security & Configuration Tips

Local development requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Do not commit secrets. Apply schema changes through `supabase/schema.sql`, and keep RLS/admin behavior aligned with the app-level route protections.
