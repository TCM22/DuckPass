'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
/** Accepts a slug, `/duck/slug`, or a full site URL to `/duck/[slug]`. */
function duckSlugFromInput(raw: string): string {
  let s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) {
    try {
      s = new URL(s).pathname;
    } catch {
      return '';
    }
  }
  s = s.replace(/^\/+/, '');
  const parts = s.split('/').filter(Boolean);
  const duckIdx = parts.indexOf('duck');
  if (duckIdx >= 0 && parts[duckIdx + 1]) {
    return parts[duckIdx + 1];
  }
  return parts[0] ?? '';
}

export default function ClaimPage() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const slug = duckSlugFromInput(value);
    if (!slug) {
      setError('Enter a Duck ID or paste a passport link.');
      return;
    }
    router.push(`/duck/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="relative min-h-[70vh] px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 left-1/2 h-72 w-[28rem] -translate-x-1/2 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-200/25 blur-3xl" />
      </div>
      <div className="dp-container relative mx-auto max-w-lg">
        <Card className="border-amber-100/90 bg-white/95 p-6 shadow-[var(--shadow-cq-md)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800/80">Claim a DuckPass</p>
          <h1 className="cq-heading mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Claim a DuckPass</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Scan or tap a DuckPass tag, or enter a Duck ID below. We&apos;ll open that duck&apos;s public passport—
            you can claim it there if it&apos;s unassigned.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="duck-id"
              label="Duck ID or link"
              placeholder="e.g. sunny-deck-42 or paste a /duck/… URL"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
            />
            {error && (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full sm:w-auto">
              Open passport
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/dashboard" className="font-semibold text-amber-700 hover:underline">
              Back to dashboard
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
