-- Admin: allow counting/viewing all scan events and deleting any duck (when profiles.role = 'admin')
-- Run after base schema.sql if the database already exists.

create policy "Admins can view all scan events"
  on public.scan_events for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can delete any duck"
  on public.ducks for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
