-- CruiseQuack MVP Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  duck_limit int not null default 10,
  suspended boolean not null default false,
  images_uploaded_count int not null default 0,
  storage_bytes_used bigint not null default 0,
  storage_quota_bytes bigint not null default 52428800,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);

-- ============================================================
-- DUCKS
-- ============================================================
create table public.ducks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text default '',
  status text not null default 'active' check (status in ('active', 'missing', 'retired', 'archived')),
  launch_ship text,
  launch_cruise text,
  launch_port text,
  launch_date date,
  photo_url text,
  check_in_count int not null default 0,
  ownership_source text not null default 'app' check (ownership_source in ('app', 'tag_presale', 'transfer', 'unclaimed')),
  claimed_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ducks_owner on public.ducks(owner_id);
create index idx_ducks_slug on public.ducks(slug);
create index idx_ducks_status on public.ducks(status);

-- ============================================================
-- CHECK-INS (finder sightings — no account required)
-- ============================================================
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  duck_id uuid not null references public.ducks(id) on delete cascade,
  finder_name text default 'Anonymous',
  finder_email text,
  action text not null default 'found' check (action in ('found', 'rehidden', 'kept', 'released')),
  ship_name text,
  cruise_name text,
  port text,
  location_description text,
  note text,
  photo_url text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index idx_checkins_duck on public.check_ins(duck_id);
create index idx_checkins_created on public.check_ins(created_at desc);

-- ============================================================
-- SCAN EVENTS (analytics placeholder — every QR/NFC scan)
-- ============================================================
create table public.scan_events (
  id uuid primary key default gen_random_uuid(),
  duck_id uuid not null references public.ducks(id) on delete cascade,
  ip_address text,
  ip_hash text,
  user_agent text,
  referer text,
  geo_hint jsonb,
  created_at timestamptz not null default now()
);

create index idx_scans_duck on public.scan_events(duck_id);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Ducks
alter table public.ducks enable row level security;

create policy "Ducks are viewable by everyone"
  on public.ducks for select using (true);

create policy "Owners can insert ducks"
  on public.ducks for insert with check (auth.uid() = owner_id);

create policy "Owners can update own ducks"
  on public.ducks for update using (auth.uid() = owner_id);

create policy "Owners can delete own ducks"
  on public.ducks for delete using (auth.uid() = owner_id);

create policy "Authenticated users can claim unclaimed ducks"
  on public.ducks for update
  using (owner_id is null and ownership_source = 'unclaimed')
  with check (auth.uid() = owner_id and ownership_source = 'app');

create policy "Admins can insert unclaimed ducks"
  on public.ducks for insert
  with check (
    owner_id is null
    and ownership_source = 'unclaimed'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update any duck"
  on public.ducks for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Check-ins
alter table public.check_ins enable row level security;

create policy "Check-ins are viewable by everyone"
  on public.check_ins for select using (true);

create policy "Anyone can insert check-ins"
  on public.check_ins for insert with check (true);

create policy "Admins can update check_ins"
  on public.check_ins for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Scan events
alter table public.scan_events enable row level security;

create policy "Scan events are insertable by anyone"
  on public.scan_events for insert with check (true);

create policy "Scan events viewable by duck owner"
  on public.scan_events for select using (
    exists (
      select 1 from public.ducks
      where ducks.id = scan_events.duck_id
      and ducks.owner_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCTION: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNCTION: increment check-in count on duck
-- ============================================================
create or replace function public.increment_duck_checkin_count()
returns trigger as $$
begin
  update public.ducks
  set check_in_count = check_in_count + 1,
      updated_at = now()
  where id = new.duck_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_checkin_created
  after insert on public.check_ins
  for each row execute function public.increment_duck_checkin_count();

-- ============================================================
-- MEDIA USAGE (Supabase Storage paths on ducks/check_ins; counters on profiles)
-- ============================================================
create or replace function public.increment_my_photo_usage(p_bytes bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_bytes is null or p_bytes < 0 or p_bytes > 10485760 then
    raise exception 'invalid byte count';
  end if;
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  update public.profiles
  set
    storage_bytes_used = storage_bytes_used + p_bytes,
    images_uploaded_count = images_uploaded_count + 1,
    updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.increment_my_photo_usage(bigint) from public;
grant execute on function public.increment_my_photo_usage(bigint) to authenticated;

create or replace function public.increment_owner_photo_usage_for_duck(p_duck_id uuid, p_bytes bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  if p_bytes is null or p_bytes < 0 or p_bytes > 10485760 then
    raise exception 'invalid byte count';
  end if;
  select owner_id into v_owner from public.ducks where id = p_duck_id;
  if v_owner is null then
    raise exception 'duck not found';
  end if;
  update public.profiles
  set
    storage_bytes_used = storage_bytes_used + p_bytes,
    images_uploaded_count = images_uploaded_count + 1,
    updated_at = now()
  where id = v_owner;
end;
$$;

revoke all on function public.increment_owner_photo_usage_for_duck(uuid, bigint) from public;
grant execute on function public.increment_owner_photo_usage_for_duck(uuid, bigint) to anon, authenticated;

-- ============================================================
-- ADMIN (role = 'admin' on profiles)
-- ============================================================
-- See migrations/002_admin_policies.sql for policies that allow admins to
-- read all scan_events and delete any duck.

-- ============================================================
-- STORAGE BUCKET (run separately if needed)
-- ============================================================
-- Storage: run migrations/006_storage_duck_photos.sql (or 008 if upgrading) — bucket id `images`.
-- Also run migrations/009_admin_image_moderation.sql for admin photo removal + MIME allowlist (no GIF).
