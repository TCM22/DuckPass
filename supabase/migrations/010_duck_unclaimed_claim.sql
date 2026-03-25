-- Unclaimed physical-tag / presale ducks: nullable owner_id + ownership_source 'unclaimed'.
-- Claim: authenticated user sets owner_id (RLS). Existing owner-created rows unchanged.

-- Widen ownership_source enum (constraint name from initial schema / 003)
alter table public.ducks drop constraint if exists ducks_ownership_source_check;
alter table public.ducks
  add constraint ducks_ownership_source_check
  check (ownership_source in ('app', 'tag_presale', 'transfer', 'unclaimed'));

alter table public.ducks alter column owner_id drop not null;

-- Unclaimed rows: no claimed_at until someone claims (existing app ducks keep claimed_at)
comment on column public.ducks.owner_id is
  'Null = not yet claimed (physical tag / presale row). Set on claim.';

-- RLS: claim — only rows that are still unclaimed
drop policy if exists "Authenticated users can claim unclaimed ducks" on public.ducks;
create policy "Authenticated users can claim unclaimed ducks"
  on public.ducks for update
  using (owner_id is null and ownership_source = 'unclaimed')
  with check (auth.uid() = owner_id and ownership_source = 'app');

-- RLS: admins can seed unclaimed placeholder ducks (slug + name; owner_id null)
drop policy if exists "Admins can insert unclaimed ducks" on public.ducks;
create policy "Admins can insert unclaimed ducks"
  on public.ducks for insert
  with check (
    owner_id is null
    and ownership_source = 'unclaimed'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Test seed (optional): run in SQL Editor as a user with admin role, or use service role:
-- insert into public.ducks (slug, name, description, ownership_source, owner_id, claimed_at)
-- values ('demo-unclaimed', 'Demo tag duck', 'Scan this slug after migration to test claim.', 'unclaimed', null, null);
