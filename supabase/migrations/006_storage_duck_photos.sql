-- Public bucket for duck, check-in, and profile images (URLs in ducks.photo_url, check_ins.photo_url, profiles.avatar_url)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_images_select_public" on storage.objects;
drop policy if exists "storage_images_insert_ducks" on storage.objects;
drop policy if exists "storage_images_update_ducks" on storage.objects;
drop policy if exists "storage_images_delete_ducks" on storage.objects;
drop policy if exists "storage_images_insert_checkins" on storage.objects;
drop policy if exists "storage_images_insert_profiles" on storage.objects;
drop policy if exists "storage_images_update_profiles" on storage.objects;
drop policy if exists "storage_images_delete_profiles" on storage.objects;

create policy "storage_images_select_public"
  on storage.objects for select
  using (bucket_id = 'images');

-- Authenticated: ducks/{user_id}/{duck_id}/*
create policy "storage_images_insert_ducks"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'ducks'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "storage_images_update_ducks"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'ducks'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "storage_images_delete_ducks"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'ducks'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Anonymous check-in photos: checkins/{duck_id}/*
create policy "storage_images_insert_checkins"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'checkins'
  );

-- Profile avatars: profiles/{user_id}/*
create policy "storage_images_insert_profiles"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'profiles'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "storage_images_update_profiles"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'profiles'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "storage_images_delete_profiles"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'profiles'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
