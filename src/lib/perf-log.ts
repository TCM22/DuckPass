/**
 * Opt-in timing for debugging perceived latency (local / Vercel preview).
 * Set NEXT_PUBLIC_PERF_LOG=1 to enable in the browser. Server code uses NODE_ENV === 'development' only.
 */
export const perfLogEnabled =
  typeof process !== 'undefined' &&
  (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_PERF_LOG === '1');

export function perfTimeStart(label: string): void {
  if (perfLogEnabled) console.time(label);
}

export function perfTimeEnd(label: string): void {
  if (perfLogEnabled) console.timeEnd(label);
}
