'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/brand';

/** Wordmark + tagline for login / signup — links home. */
export function AuthBrandMark() {
  return (
    <Link
      href="/"
      className="group mb-6 block text-center transition-opacity hover:opacity-90"
    >
      <span className="mb-2 block text-4xl" aria-hidden>
        🦆
      </span>
      <span className="cq-heading block text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-amber-800">
        {BRAND.name}
      </span>
      <span className="mt-1 block text-sm text-slate-500">{BRAND.tagline}</span>
    </Link>
  );
}
