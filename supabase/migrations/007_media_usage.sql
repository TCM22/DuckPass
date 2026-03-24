-- Per-user photo usage (paths only in ducks/check_ins; bytes tracked here for cost visibility)
-- storage_quota_bytes: default free-tier cap; raise via plan / admin later

alter table public.profiles
  add column if not exists images_uploaded_count int not null default 0;

alter table public.profiles
  add column if not exists storage_bytes_used bigint not null default 0;

alter table public.profiles
  add column if not exists storage_quota_bytes bigint not null default 52428800; -- 50 MB

comment on column public.profiles.images_uploaded_count is 'Successful image uploads attributed to this account (owner uploads + finder photos on their ducks).';
comment on column public.profiles.storage_bytes_used is 'Sum of uploaded file sizes (approximate; replacements add without subtracting old object).';
comment on column public.profiles.storage_quota_bytes is 'Soft limit for future paid tiers; not enforced in app yet.';

-- Authenticated user: record own upload (duck photo, new duck photo)
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

-- Anonymous finder: attribute bytes to duck owner (same bucket cost model)
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
