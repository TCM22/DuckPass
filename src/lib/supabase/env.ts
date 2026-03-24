/**
 * Supabase public env (browser + server). Supports legacy anon JWT and new publishable keys.
 * @see https://supabase.com/docs/guides/api/api-keys
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url?.trim()) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  return url.trim();
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  }
  return key;
}
