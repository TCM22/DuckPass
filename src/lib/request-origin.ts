import { headers } from 'next/headers';
import { getConfiguredSiteOrigin, getPublicSiteUrlFallback } from '@/lib/site-url';

/**
 * Base URL for public duck links on the server.
 * 1) `NEXT_PUBLIC_SITE_URL` or legacy `NEXT_PUBLIC_APP_URL` when set
 * 2) Else request `Host` / `X-Forwarded-*` (works behind reverse proxies)
 * 3) Else same default as `getPublicSiteUrlFallback()` in `@/lib/site-url`
 */
export async function getPublicSiteUrl(): Promise<string> {
  const configured = getConfiguredSiteOrigin();
  if (configured) return configured;

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto =
    h.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
    (h.get('x-forwarded-ssl') === 'on' ? 'https' : 'http');

  if (host) {
    const safeProto = proto === 'http' || proto === 'https' ? proto : 'https';
    return `${safeProto}://${host}`;
  }

  return getPublicSiteUrlFallback();
}
