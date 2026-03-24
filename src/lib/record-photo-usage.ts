import type { SupabaseClient } from '@supabase/supabase-js';

/** Call after a successful owner-side storage upload. */
export async function recordMyPhotoUsage(supabase: SupabaseClient, bytes: number) {
  return supabase.rpc('increment_my_photo_usage', { p_bytes: bytes });
}

/** Call after a successful finder check-in photo upload (attributes usage to duck owner). */
export async function recordFinderPhotoForOwner(supabase: SupabaseClient, duckId: string, bytes: number) {
  return supabase.rpc('increment_owner_photo_usage_for_duck', {
    p_duck_id: duckId,
    p_bytes: bytes,
  });
}
