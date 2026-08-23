-- Steady: Supabase schema
-- Run this in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query)

-- 1. Habits table
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  sort_order integer not null default 0
);

-- 2. Entries table (one row per habit per day it was completed)
create table entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, entry_date)
);

-- 3. Helpful indexes
create index habits_user_id_idx on habits(user_id);
create index entries_habit_id_idx on entries(habit_id);
create index entries_user_date_idx on entries(user_id, entry_date);

-- 4. Row Level Security: every user can only ever see/edit their own rows
alter table habits enable row level security;
alter table entries enable row level security;

create policy "Users can view their own habits"
  on habits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habits"
  on habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on habits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on habits for delete
  using (auth.uid() = user_id);

create policy "Users can view their own entries"
  on entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on entries for delete
  using (auth.uid() = user_id);
