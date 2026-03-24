-- Suspend accounts + let admins update profiles for moderation.

alter table public.profiles
  add column if not exists suspended boolean not null default false;

create index if not exists idx_profiles_suspended on public.profiles(suspended) where suspended = true;

comment on column public.profiles.suspended is 'When true, user cannot use dashboard / admin (see app middleware).';

-- Admins can update any profile (role, suspended, display_name, etc.) for moderation.
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
