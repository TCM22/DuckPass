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

/** Full HTTPS URL for a path in the `images` bucket (what `ducks.photo_url` should store). */
export function duckImagePublicUrl(supabase: SupabaseClient, path: string): string {
  const { data } = imagesStorage(supabase).getPublicUrl(path);
  return data.publicUrl;
}

/** Max size after client-side compression (matches bucket file_size_limit in storage migrations). */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Reject originals larger than this before decode (keeps memory safe on mobile / abuse). */
export const PHOTO_INPUT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Target max edge length before upload (see `compressImageForUpload`). */
export const PHOTO_MAX_EDGE_PX = 1024;

/** Allowed before compression; output is normalized to JPEG in `compressImageForUpload`. */
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export function isAllowedImageMimeType(mime: string): mime is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

export const ACCEPT_IMAGE = ALLOWED_IMAGE_MIME_TYPES.join(',');

/** Client-side validation before compression / upload. */
export function validateImageFileForUpload(file: File): string | null {
  if (!isAllowedImageMimeType(file.type)) {
    return 'Please use a JPEG, PNG, or WebP image (GIF and other types are not supported).';
  }
  if (file.size > PHOTO_INPUT_MAX_BYTES) {
    return `Image must be ${Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB or smaller.`;
  }
  return null;
}

/** User-facing message for Supabase Storage upload failures. */
export function formatImageUploadError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('mime type') || m.includes('not allowed') || m.includes('invalid')) {
    return 'This file type is not allowed. Use JPEG, PNG, or WebP.';
  }
  if (m.includes('payload too large') || m.includes('too large') || m.includes('exceeded')) {
    return 'File is too large after processing. Try a smaller image.';
  }
  if (m.includes('already exists')) {
    return 'Upload conflict — please try again.';
  }
  return message || 'Photo upload failed. Please try again.';
}

/**
 * Object path inside the `images` bucket from a public object URL, or null if not our bucket URL.
 */
export function imagesBucketPathFromPublicUrl(publicUrl: string | null | undefined): string | null {
  if (!publicUrl?.trim()) return null;
  const marker = `/object/public/${IMAGES_BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  const path = publicUrl.slice(i + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

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
  return 'jpg';
}
