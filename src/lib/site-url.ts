/**
 * Public site origin for share/QR/copy links (not Supabase storage URLs).
 *
 * Primary env: `NEXT_PUBLIC_SITE_URL` (production, preview, or a stable tunnel URL).
 * `NEXT_PUBLIC_APP_URL` is a legacy alias — set only one of them in `.env.local`.
 */
export function getConfiguredSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  return raw ? raw.replace(/\/$/, '') : '';
}

/** Dev default when no public URL is configured (matches `npm run dev` default port). */
export function getPublicSiteUrlFallback(): string {
  return 'http://localhost:3000';
}

/**
 * Client-only: origin for `getDuckUrl` / clipboard when there is no request (no `Host` headers).
 * Server routes should use `getPublicSiteUrl` from `@/lib/request-origin` instead.
 */
export function getClientPublicSiteOrigin(): string {
  return getConfiguredSiteOrigin() || getPublicSiteUrlFallback();
}

/**
 * Base origin for Supabase auth redirects (`emailRedirectTo`, `redirectTo`).
 * Prefer `NEXT_PUBLIC_SITE_URL` (or legacy `NEXT_PUBLIC_APP_URL`); falls back to `http://localhost:3000` when unset.
 * Add this origin to Supabase → Authentication → URL Configuration → Redirect URLs.
 */
export function getAuthSiteOrigin(): string {
  return getClientPublicSiteOrigin();
}

/** Full URL for Supabase `resetPasswordForEmail` — must be listed in Supabase Auth redirect URLs. */
export function getPasswordRecoveryRedirectUrl(): string {
  const origin = getAuthSiteOrigin();
  const next = encodeURIComponent('/account/reset-password');
  return `${origin}/auth/callback?next=${next}`;
}
