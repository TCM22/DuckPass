-- Future claim / physical-tag flow: lightweight columns (no behavior change for MVP).
-- Existing rows: all ducks are "app" created; claimed_at backfilled to created_at.

alter table public.ducks
  add column if not exists ownership_source text not null default 'app'
    check (ownership_source in ('app', 'tag_presale', 'transfer'));

alter table public.ducks
  add column if not exists claimed_at timestamptz;

comment on column public.ducks.ownership_source is
  'app = created in dashboard; tag_presale = reserved for pre-registered physical tags; transfer = ownership moved (e.g. claim).';

comment on column public.ducks.claimed_at is
  'When ownership was finalized. Backfilled to created_at for app-created ducks.';

update public.ducks
set claimed_at = created_at
where claimed_at is null;

alter table public.ducks
  alter column claimed_at set default now();
