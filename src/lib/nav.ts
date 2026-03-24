/** Prevent open redirects from `next` / `redirect` query params. */
export function safeAppPath(path: string | null | undefined, fallback: string): string {
  const p = (path ?? fallback).trim() || fallback;
  if (!p.startsWith('/') || p.startsWith('//')) return fallback;
  return p;
}
