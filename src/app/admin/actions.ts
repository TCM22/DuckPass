'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';

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
