import { headers } from 'next/headers';

/**
 * Public base URL for the current request (tunnel / ngrok–safe).
 * Prefer forwarded headers from the edge proxy over a static NEXT_PUBLIC_APP_URL.
 */
export async function getPublicSiteUrl(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto =
    h.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
    (h.get('x-forwarded-ssl') === 'on' ? 'https' : 'http');

  if (host) {
    const safeProto = proto === 'http' || proto === 'https' ? proto : 'https';
    return `${safeProto}://${host}`;
  }

  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, '');

  return 'http://localhost:3000';
}
