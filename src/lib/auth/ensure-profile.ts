import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Ensures `public.profiles` has a row for the current user. Safe if a DB trigger
 * already created it (upsert is idempotent for our columns).
 */
export async function ensureProfile(supabase: SupabaseClient): Promise<void> {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    console.error('[ensureProfile] getUser failed', userErr);
    return;
  }
  if (!user) {
    console.warn('[ensureProfile] no session user');
    return;
  }

  const displayName =
    (typeof user.user_metadata?.display_name === 'string' &&
      user.user_metadata.display_name.trim()) ||
    user.email?.split('@')[0] ||
    'User';

  const { error } = await supabase.from('profiles').upsert(
    { id: user.id, display_name: displayName },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('[ensureProfile] profiles upsert failed', error.message, error);
  } else {
    console.log('[ensureProfile] ok for user', user.id);
  }
}
