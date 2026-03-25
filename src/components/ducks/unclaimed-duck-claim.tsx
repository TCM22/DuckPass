'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BRAND } from '@/lib/brand';
import { linkButtonClass } from '@/lib/button-styles';
import { claimDuckAction } from '@/app/duck/actions';
import type { Duck } from '@/lib/types';
import toast from 'react-hot-toast';

const loginRedirect = (slug: string) => `/login?redirect=${encodeURIComponent(`/duck/${slug}`)}`;

/** Duck rows eligible for the public claim flow (caller must only pass when DB matches). */
export type UnclaimedDuckForClaim = Duck & {
  owner_id: null;
  ownership_source: 'unclaimed';
};

export function UnclaimedDuckClaim({ duck }: { duck: UnclaimedDuckForClaim }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  const description =
    typeof duck.description === 'string' && duck.description.trim() ? duck.description : null;

  useEffect(() => {
    let cancelled = false;
    const client = createClient();
    void client.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      setSignedIn(Boolean(user));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const result = await claimDuckAction(duck.slug);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('This duck is now on your passport desk!');
      router.push(`/dashboard/ducks/${result.slug}?claimed=1`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="relative mx-auto max-w-lg px-4 py-16 text-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-lg px-4 py-10 sm:py-14">
      <Card className="border-amber-200/90 bg-gradient-to-br from-white via-amber-50/40 to-sky-50/30 p-6 shadow-[var(--shadow-cq-md)] sm:p-8">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800/90">
          {BRAND.name}
        </p>
        <div className="mt-6 text-center text-5xl" aria-hidden>
          🦆
        </div>
        <h1 className="cq-heading mt-4 text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
          {duck.name}
        </h1>
        <p className="mt-2 text-center font-mono text-xs text-amber-800/80">#{duck.slug}</p>
        {description ? (
          <p className="mt-4 text-center text-sm leading-relaxed text-slate-600">{description}</p>
        ) : (
          <p className="mt-4 text-center text-sm italic text-slate-400">
            No story yet — claim this duck to get started.
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-sky-200/80 bg-sky-50/50 px-4 py-4 text-sm leading-relaxed text-sky-950">
          <p className="font-semibold text-sky-900">This passport isn&apos;t claimed yet</p>
          <p className="mt-2 text-sky-900/90">
            If you have this physical duck or tag, you can claim it and attach it to your account. After claiming,
            you&apos;ll be able to customize the passport, add a photo, and share the QR.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {!signedIn ? (
            <>
              <Link
                href={loginRedirect(duck.slug)}
                className={linkButtonClass('primary', 'lg', 'w-full justify-center sm:w-auto sm:min-w-[11rem]')}
              >
                Log in to claim
              </Link>
              <Link
                href={`/signup?redirect=${encodeURIComponent(`/duck/${duck.slug}`)}`}
                className={linkButtonClass('outline', 'lg', 'w-full justify-center sm:w-auto sm:min-w-[11rem]')}
              >
                Create account
              </Link>
            </>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full sm:mx-auto sm:max-w-md"
              loading={loading}
              onClick={() => void handleClaim()}
            >
              Claim this duck
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Duck ID <span className="font-mono text-slate-500">{duck.id.slice(0, 8)}…</span>
        </p>
      </Card>
    </div>
  );
}
