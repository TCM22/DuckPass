'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { IMAGES_BUCKET, imagesBucketPathFromPublicUrl } from '@/lib/photo-storage';

export async function deleteDuckAdmin(duckId: string): Promise<{ ok?: true; error?: string }> {
  if (!duckId) {
    return { error: 'Missing duck id' };
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase.from('ducks').delete().eq('id', duckId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { ok: true };
}

export async function updateUserAdmin(
  userId: string,
  patch: { role?: 'user' | 'admin'; suspended?: boolean }
): Promise<{ ok?: true; error?: string }> {
  if (!userId) {
    return { error: 'Missing user id' };
  }

  const { supabase, user } = await requireAdmin();

  if (userId === user.id) {
    if (patch.suspended) {
      return { error: 'You cannot suspend your own account.' };
    }
    if (patch.role === 'user') {
      return { error: 'You cannot remove your own admin role.' };
    }
  }

  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { ok: true };
}

/** Clears `photo_url` and deletes the file from the public `images` bucket (admin only; see migration 009). */
export async function adminRemoveStoredPhoto(
  kind: 'duck' | 'check_in',
  rowId: string
): Promise<{ ok?: true; error?: string }> {
  if (!rowId) {
    return { error: 'Missing row id' };
  }

  const { supabase } = await requireAdmin();
  const table = kind === 'duck' ? 'ducks' : 'check_ins';

  const { data: row, error: fetchErr } = await supabase.from(table).select('photo_url').eq('id', rowId).single();
  if (fetchErr) {
    return { error: fetchErr.message };
  }

  const url = row?.photo_url as string | null | undefined;
  if (!url?.trim()) {
    revalidatePath('/admin');
    return { ok: true };
  }

  const path = imagesBucketPathFromPublicUrl(url);
  if (path) {
    const { error: rmErr } = await supabase.storage.from(IMAGES_BUCKET).remove([path]);
    if (rmErr) {
      return { error: rmErr.message };
    }
  }

  const { error: upErr } = await supabase.from(table).update({ photo_url: null }).eq('id', rowId);
  if (upErr) {
    return { error: upErr.message };
  }

  revalidatePath('/admin');
  return { ok: true };
}
