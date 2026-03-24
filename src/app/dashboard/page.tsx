import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { linkButtonClass } from '@/lib/button-styles';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { DuckCard } from '@/components/ducks/duck-card';
import { RecentCheckIns } from '@/components/ducks/recent-check-ins';
import { StatCard } from '@/components/dashboard/stat-card';
import { FeaturePlaceholders } from '@/components/dashboard/feature-placeholders';
import { PlanSection } from '@/components/dashboard/plan-section';
import type { Duck, CheckIn } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('plan, duck_limit')
    .eq('id', user.id)
    .maybeSingle();

  const { data: ducks } = await supabase
    .from('ducks')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const duckIds = (ducks || []).map((d: Duck) => d.id);

  let recentCheckIns: CheckIn[] = [];
  let lastSeenByDuck: Record<string, string> = {};

  if (duckIds.length > 0) {
    const { data: recent } = await supabase
      .from('check_ins')
      .select('*')
      .in('duck_id', duckIds)
      .order('created_at', { ascending: false })
      .limit(10);
    recentCheckIns = recent || [];

    const { data: forLastSeen } = await supabase
      .from('check_ins')
      .select('duck_id, created_at')
      .in('duck_id', duckIds)
      .order('created_at', { ascending: false })
      .limit(500);

    if (forLastSeen) {
      for (const row of forLastSeen) {
        if (!lastSeenByDuck[row.duck_id]) {
          lastSeenByDuck[row.duck_id] = row.created_at;
        }
      }
    }
  }

  const totalCheckIns = ducks?.reduce((sum: number, d: Duck) => sum + d.check_in_count, 0) || 0;
  const activeCount = ducks?.filter((d: Duck) => d.status === 'active').length || 0;

  const hasDucks = ducks && ducks.length > 0;
  const noFindsYet = hasDucks && recentCheckIns.length === 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-white via-amber-50/40 to-sky-50/50 px-5 py-8 shadow-[var(--shadow-cq-md)] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-300/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700/80">Passport desk</p>
            <h1 className="cq-heading text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Your ducks at a glance
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600">
              Register ducks, attach QR or NFC, and follow every finder check-in—same calm hub, trip after trip.
            </p>
            {hasDucks && (
              <p className="pt-1 text-sm leading-relaxed text-slate-600">
                Tracking{' '}
                <strong className="text-slate-800">{ducks!.length}</strong> passport
                {ducks!.length !== 1 ? 's' : ''}. Finder check-ins show up in Recent activity below.
              </p>
            )}
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:max-w-md lg:justify-end">
            <Link
              href="/dashboard/ducks/new"
              className={linkButtonClass('primary', 'lg', 'w-full min-w-0 sm:w-auto sm:min-w-[12.5rem]')}
            >
              + Register a duck
            </Link>
            <Link
              href="/"
              className={linkButtonClass('subtle', 'lg', 'w-full min-w-0 border-2 sm:w-auto sm:min-w-[10rem]')}
            >
              View site
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="cq-heading sr-only">Passport statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total ducks" value={ducks?.length || 0} icon="🦆" accent="amber" />
          <StatCard label="Active" value={activeCount} icon="✅" accent="teal" />
          <StatCard label="Total finds" value={totalCheckIns} icon="📍" accent="sky" />
          <StatCard
            label="Need attention"
            value={ducks?.filter((d: Duck) => d.status === 'missing').length || 0}
            icon="❓"
            accent="slate"
            sublabel="Marked missing"
          />
        </div>
      </section>

      <section aria-label="Plan">
        <PlanSection
          plan={profileRow?.plan ?? 'free'}
          duckLimit={profileRow?.duck_limit ?? 10}
        />
      </section>

      {/* Quick actions strip — only when user has ducks */}
      {ducks && ducks.length > 0 && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-amber-200/70 bg-amber-50/30 px-4 py-4 sm:gap-3 sm:px-5 sm:py-4">
          <span className="w-full text-xs font-bold uppercase tracking-wider text-slate-500 sm:w-auto sm:shrink-0">
            Quick actions
          </span>
          <Link
            href="/dashboard/ducks/new"
            className={linkButtonClass('secondary', 'sm', 'min-w-0 flex-1 sm:flex-initial')}
          >
            Add another duck
          </Link>
          <Link
            href={ducks[0] ? `/duck/${ducks[0].slug}` : '/dashboard'}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButtonClass('outline', 'sm', 'min-w-0 flex-1 sm:flex-initial')}
          >
            Preview a passport ↗
          </Link>
        </section>
      )}

      {/* Main grid or empty */}
      {!ducks || ducks.length === 0 ? (
        <EmptyState
          variant="hero"
          icon="🎫"
          title="Your passport rack is empty"
          description="Issue a passport for each duck, attach a printed or waterproof QR tag, and watch finds roll in from the deck."
          hints={[
            'Register a duck with a name and launch details',
            'Download the QR and attach it with a tag or sticker',
            'Finders scan and log finds—no account required for them',
          ]}
          action={
            <>
              <Link href="/dashboard/ducks/new" className={linkButtonClass('primary', 'lg')}>
                Register your first duck
              </Link>
              <Link
                href="/"
                className={linkButtonClass('ghost', 'lg', 'text-slate-700 hover:bg-white/60')}
              >
                How it works
              </Link>
            </>
          }
        />
      ) : (
        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <h2 className="cq-heading text-xl font-semibold text-slate-900 sm:text-2xl">Passports</h2>
              <p className="text-sm leading-relaxed text-slate-500">
                Open a card to manage QR, story, and find history.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {ducks.map((duck: Duck) => (
              <DuckCard key={duck.id} duck={duck} lastSeenAt={lastSeenByDuck[duck.id] ?? null} />
            ))}
          </div>
        </section>
      )}

      {/* No finds yet — fills empty space without extra data */}
      {noFindsYet && (
        <Card
          variant="outlined"
          className="border-sky-200/70 bg-gradient-to-br from-sky-50/40 to-white py-5 sm:py-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-sky-200/60"
                aria-hidden
              >
                ✉️
              </span>
              <div>
                <p className="font-semibold text-slate-900">Waiting for the first find</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                  Share a duck&apos;s public passport or QR so finders can log a check-in—no account needed on their
                  side.
                </p>
              </div>
            </div>
            {ducks?.[0] && (
              <Link
                href={`/duck/${ducks[0].slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkButtonClass(
                  'subtle',
                  'md',
                  'shrink-0 bg-white text-sky-800 ring-1 ring-sky-200/80 hover:bg-sky-50'
                )}
              >
                Open passport ↗
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Recent activity — always visible when logged in */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/60 p-6 shadow-[var(--shadow-cq-sm)] backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-amber-50 text-lg shadow-sm ring-1 ring-sky-200/50">
            📡
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="cq-heading text-xl font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Latest finder check-ins across your passports
            </p>
          </div>
        </div>
        {recentCheckIns.length > 0 ? (
          <RecentCheckIns checkIns={recentCheckIns} ducks={ducks || []} />
        ) : (
          <Card variant="outlined" className="border-dashed border-slate-200/90 bg-slate-50/40 py-10 text-center">
            <p className="text-slate-600">No finder check-ins yet.</p>
            <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">
              {hasDucks
                ? 'Share a passport link or QR from any duck\'s manage page—activity will land here first.'
                : 'Register a duck and share its QR. You’ll see ship, port, and notes from finders here.'}
            </p>
          </Card>
        )}
      </section>

      <FeaturePlaceholders />
    </div>
  );
}
