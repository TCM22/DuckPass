'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth/ensure-profile';

export type ClaimDuckResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

/**
 * Assigns an unclaimed duck (`owner_id` null, `ownership_source = unclaimed`) to the current user.
 */
export async function claimDuckAction(slug: string): Promise<ClaimDuckResult> {
  const trimmed = slug.trim();
  if (!trimmed) {
    return { ok: false, error: 'Invalid duck.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be signed in to claim this duck.' };
  }

  await ensureProfile(supabase);

  const { data: duck, error: fetchErr } = await supabase
    .from('ducks')
    .select('id, owner_id, ownership_source')
    .eq('slug', trimmed)
    .maybeSingle();

  if (fetchErr || !duck) {
    return { ok: false, error: 'Duck not found.' };
  }

  if (duck.owner_id != null) {
    return { ok: false, error: 'This duck is already claimed.' };
  }

  if (duck.ownership_source !== 'unclaimed') {
    return { ok: false, error: 'This duck cannot be claimed.' };
  }

  const { data: profile } = await supabase.from('profiles').select('duck_limit').eq('id', user.id).maybeSingle();
  const limit = profile?.duck_limit ?? 10;

  const { count, error: countErr } = await supabase
    .from('ducks')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  if (countErr) {
    return { ok: false, error: countErr.message };
  }

  if ((count ?? 0) >= limit) {
    return {
      ok: false,
      error: `You've reached your passport limit (${limit}). Upgrade your plan or remove a duck before claiming this one.`,
    };
  }

  const { error: updateErr } = await supabase
    .from('ducks')
    .update({
      owner_id: user.id,
      ownership_source: 'app',
      claimed_at: new Date().toISOString(),
    })
    .eq('id', duck.id)
    .is('owner_id', null);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  revalidatePath(`/duck/${trimmed}`);
  revalidatePath('/dashboard');
  revalidatePath('/');

  return { ok: true, slug: trimmed };
}
