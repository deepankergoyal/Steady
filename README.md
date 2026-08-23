# Steady — a quiet habit tracker

React + Vite frontend, Supabase backend (auth + database, so your data syncs across devices).

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project (free)

1. Go to https://supabase.com and sign up / sign in.
2. Click **New Project**. Pick any name and database password.
3. Wait ~1 minute for it to finish provisioning.

## 3. Set up the database

1. In your Supabase project, open **SQL Editor** → **New query**.
2. Copy everything from `supabase-schema.sql` (in this folder) and paste it in.
3. Click **Run**. You should see "Success. No rows returned."

This creates `habits` and `entries` tables with row-level security, so each account only ever sees its own data.

## 4. Add your API keys

1. In Supabase: **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon / public** key.
3. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
4. Paste your values into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

`.env` is already gitignored, so your keys won't get committed if you push this to GitHub.

## 5. (Optional) Skip email confirmation for faster testing

Supabase requires confirming your email before signing in, by default. To skip that while testing:

- **Authentication** → **Providers** → **Email** → turn off "Confirm email".

## 6. Run it

```bash
npm run dev
```

Visit the local URL it prints (usually `http://localhost:5173`). Sign up with any email/password, and you're in.

## 7. Deploy

```bash
npm run build
```

This outputs a static `dist/` folder — deploy it to Netlify, Vercel, GitHub Pages, or any static host. Just remember to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting provider's dashboard (not just your local `.env`, which won't be deployed).

## Project structure

```
src/
  components/
    AuthScreen.jsx     — sign in / sign up form
    TodayView.jsx       — today's checklist
    MonthView.jsx        — month calendar grid
    HabitRow.jsx          — single habit's row + "thread" line rendering
  lib/
    supabaseClient.js       — Supabase client setup
    useAuth.js                — auth session hook
    useHabits.js                — habit/entry data + mutations hook
    dateHelpers.js                — date/streak utility functions
  App.jsx                          — top-level layout & routing between views
  index.css                          — all styling
supabase-schema.sql                   — database setup (run once in Supabase)
```
# Steady
