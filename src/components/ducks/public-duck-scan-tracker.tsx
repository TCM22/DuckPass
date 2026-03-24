'use client';

import { useEffect, useRef } from 'react';
import { recordScanEvent } from '@/app/actions/scan-events';

/** Fires once per tab session per duck (sessionStorage) to record a public page view. */
export function PublicDuckScanTracker({ duckId }: { duckId: string }) {
  const done = useRef(false);

  useEffect(() => {
    if (!duckId || done.current) return;
    const key = `dp_scan_${duckId}`;
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return;
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, '1');
    } catch {
      /* private mode */
    }
    done.current = true;
    void recordScanEvent(duckId).catch(() => {});
  }, [duckId]);

  return null;
}
