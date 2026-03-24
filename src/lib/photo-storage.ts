import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Canonical public bucket id for all app images.
 * (Historically some setups used `duck-photos`; migrations 006/008 create `images`.)
 */
export const IMAGES_BUCKET = 'images' as const;

/** Use this for every upload + getPublicUrl so bucket name cannot drift. */
export function imagesStorage(supabase: SupabaseClient) {
  return supabase.storage.from(IMAGES_BUCKET);
}

/** Max size after client-side compression (matches bucket file_size_limit in storage migrations). */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Reject originals larger than this before decode (keeps memory safe on mobile). */
export const PHOTO_INPUT_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/** Target max edge length before upload (see `compressImageForUpload`). */
export const PHOTO_MAX_EDGE_PX = 1024;

export const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif';

/** Unique filename so uploads never overwrite each other (public URL changes per upload). */
export function uniqueImageFilename(ext: string): string {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `img-${id}.${ext}`;
}

/** Duck passport photos: ducks/{userId}/{duckId}/{filename} */
export function duckPhotoPath(userId: string, duckId: string, filename: string) {
  return `ducks/${userId}/${duckId}/${filename}`;
}

/** Finder check-in photos: checkins/{duckId}/{unique}.{ext} */
export function checkinPhotoPath(duckId: string, uniqueId: string, ext: string) {
  return `checkins/${duckId}/${uniqueId}.${ext}`;
}

/** Profile avatars (future): profiles/{userId}/{filename} */
export function profilePhotoPath(userId: string, filename: string) {
  return `profiles/${userId}/${filename}`;
}

export function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}
