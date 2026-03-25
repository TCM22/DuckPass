'use client';

import { useEffect } from 'react';

/**
 * Production: register `/sw.js` for PWA installability.
 * Development: unregister any existing workers for this origin so a stale SW from
 * `next start` / production preview on the same host (e.g. localhost) cannot keep
 * serving old assets or masking HMR — a common cause of “dev doesn’t update until I build”.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'development') {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {});
      return;
    }

    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal: offline shell is optional
    });
  }, []);

  return null;
}
