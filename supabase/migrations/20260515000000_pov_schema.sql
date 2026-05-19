-- Events
create table events (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,             -- 6-char join code, uppercase
  name           text not null,
  host_id        uuid references auth.users on delete cascade,
  delay_minutes  integer not null default 60,      -- film development delay
  max_shots      integer not null default 27,      -- classic disposable limit
  created_at     timestamptz default now(),
  expires_at     timestamptz                       -- optional
);

-- Photos
create table photos (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid references events(id) on delete cascade,
  taker_id      uuid references auth.users,
  taker_name    text not null,
  storage_path  text not null,                     -- path in Supabase Storage
  taken_at      timestamptz default now(),
  reveal_at     timestamptz not null,              -- taken_at + delay_minutes
  revealed      boolean default false,
  created_at    timestamptz default now()
);

-- RLS
alter table events enable row level security;
alter table photos enable row level security;

-- Anyone can read events (to validate a join code)
create policy "events_read" on events for select using (true);
-- Only host can create events
create policy "events_insert" on events for insert with check (auth.uid() = host_id);

-- Authenticated users can read all photos (the UI handles hiding unrevealed images)
create policy "photos_read" on photos for select to authenticated using (true);
-- Authenticated users can insert their own photos
create policy "photos_insert" on photos for insert with check (auth.uid() = taker_id);
-- System/host can flip revealed flag
create policy "photos_update" on photos for update using (true);

-- Realtime
alter publication supabase_realtime add table photos;
