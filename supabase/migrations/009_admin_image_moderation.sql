-- Let admins clear inappropriate images: DB row + storage object.
-- Duck owner uploads remain authenticated-only via existing storage policies; finder check-ins stay anonymous insert.

drop policy if exists "Admins can update any duck" on public.ducks;
create policy "Admins can update any duck"
  on public.ducks for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Admins can update check_ins" on public.check_ins;
create policy "Admins can update check_ins"
  on public.check_ins for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "storage_images_delete_admin" on storage.objects;
create policy "storage_images_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Match app allowlist (no GIF)
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'images';
