'use client';

import { useEffect } from 'react';

/** Registers the app service worker in production for PWA installability. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal: offline shell is optional
    });
  }, []);

  return null;
}
