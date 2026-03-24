import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPublicSiteUrl } from '@/lib/request-origin';
import { getDuckUrl, formatDate, formatDateTime, ACTION_LABELS, STATUS_LABELS } from '@/lib/utils';
import type { Metadata } from 'next';
import { BRAND, duckPublicDescription, duckPublicTitle } from '@/lib/brand';
import type { DuckWithProfile, CheckIn } from '@/lib/types';
import { PublicPassportShare } from '@/components/ducks/public-passport-share';
import { PublicDuckScanTracker } from '@/components/ducks/public-duck-scan-tracker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: duck } = await supabase
    .from('ducks')
    .select('name, description, photo_url')
    .eq('slug', slug)
    .single();

  if (!duck) return { title: 'Duck Not Found' };

  const title = duckPublicTitle(duck.name);
  const description = duckPublicDescription(duck.name, duck.description);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: duck.photo_url ? [{ url: duck.photo_url }] : undefined,
    },
  };
}

function JourneyMapPlaceholder({ hints }: { hints: string[] }) {
  return (
    <Card variant="outlined" className="border-dashed border-sky-200/80 bg-sky-50/30">
      <p className="text-xs font-bold uppercase tracking-wider text-sky-800/80">Journey map</p>
      <p className="mt-2 text-sm text-slate-600">
        A full map of this duck&apos;s travels is on the roadmap. For now, places below come from finder check-ins
        (and later, approximate scan regions — never exact GPS from a scan alone).
      </p>
      {hints.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {hints.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="text-amber-500">📍</span>
              {h}
            </li>
          ))}
        </ul>
      )}
      {hints.length === 0 && <p className="mt-2 text-sm text-slate-500">No location hints yet — be the first to check in.</p>}
    </Card>
  );
}

export default async function PublicDuckPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: duck } = (await supabase
    .from('ducks')
    .select('*, profiles(display_name, avatar_url)')
    .eq('slug', slug)
    .single()) as { data: DuckWithProfile | null };

  if (!duck) notFound();

  const { data: checkIns } = (await supabase
    .from('check_ins')
    .select('*')
    .eq('duck_id', duck.id)
    .order('created_at', { ascending: false })
    .limit(40)) as { data: CheckIn[] | null };

  const publicBase = await getPublicSiteUrl();
  const publicUrl = getDuckUrl(duck.slug, publicBase);

  const locationHints = Array.from(
    new Set(
      (checkIns || [])
        .flatMap((c) => [c.port, c.ship_name, c.location_description].filter(Boolean) as string[])
        .slice(0, 8)
    )
  );

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <PublicDuckScanTracker duckId={duck.id} />

      {/* Passport hero */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-sky-50 shadow-[var(--shadow-cq-md)]">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl"
          aria-hidden
        />
        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800/90">
            {BRAND.name} passport
          </p>
          <div className="mx-auto mt-6 flex max-w-xs justify-center">
            {duck.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={duck.photo_url}
                alt=""
                className="h-40 w-40 rounded-3xl object-cover shadow-lg ring-4 ring-white/90 sm:h-44 sm:w-44"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-sky-100 text-7xl shadow-inner ring-4 ring-white/90 sm:h-44 sm:w-44">
                🦆
              </div>
            )}
          </div>
          <h1 className="cq-heading mt-6 text-center text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            {duck.name}
          </h1>
          <p className="mt-2 text-center font-mono text-xs text-amber-800/80">#{duck.slug}</p>
          <p className="mt-3 text-center text-sm font-medium text-slate-600">
            {STATUS_LABELS[duck.status] || duck.status}
            <span className="text-slate-400"> · </span>
            {duck.check_in_count} finder check-in{duck.check_in_count !== 1 ? 's' : ''}
          </p>
          {duck.description ? (
            <p className="mx-auto mt-5 max-w-prose text-center text-sm leading-relaxed text-slate-600">{duck.description}</p>
          ) : (
            <p className="mx-auto mt-5 max-w-prose text-center text-sm italic text-slate-400">No story yet — check in and say hi.</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
            {duck.profiles?.display_name && (
              <span>
                <span className="text-slate-400">Passport by</span> {duck.profiles.display_name}
              </span>
            )}
            {duck.launch_ship && (
              <span>
                🚢 {duck.launch_ship}
              </span>
            )}
            {duck.launch_cruise && <span>🗺️ {duck.launch_cruise}</span>}
            {duck.launch_port && <span>⚓ {duck.launch_port}</span>}
            {duck.launch_date && <span>📅 {formatDate(duck.launch_date)}</span>}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Link href={`/duck/${duck.slug}/checkin`} className="block">
          <Button size="lg" className="w-full min-h-14 text-base shadow-md">
            I found this duck — log a check-in
          </Button>
        </Link>
        <p className="text-center text-xs text-slate-500">No account needed · takes under a minute</p>
      </div>

      <div className="mt-10">
        <PublicPassportShare publicUrl={publicUrl} slug={duck.slug} duckName={duck.name} />
      </div>

      <div className="mt-10">
        <h2 className="cq-heading text-lg font-semibold text-slate-900">Recent stamps</h2>
        <p className="mt-1 text-sm text-slate-500">Latest finder check-ins for this passport</p>
        {!checkIns || checkIns.length === 0 ? (
          <Card variant="outlined" className="mt-4 py-12 text-center">
            <p className="text-slate-600">No check-ins yet.</p>
            <p className="mt-2 text-sm text-slate-500">Scan the QR or open this page and tap the button above to be the first.</p>
          </Card>
        ) : (
          <div className="mt-4 space-y-4">
            {checkIns.map((ci, idx) => (
              <div key={ci.id} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="h-3 w-3 rounded-full bg-amber-400 ring-2 ring-amber-100" />
                  {idx < checkIns.length - 1 && <div className="mt-1 w-px flex-1 bg-amber-200/80" />}
                </div>
                <Card variant="outlined" className="min-w-0 flex-1 border-slate-200/90 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-900">{ci.finder_name || 'Anonymous'}</span>
                      <span className="ml-2 text-sm text-slate-500">{ACTION_LABELS[ci.action] || ci.action}</span>
                    </div>
                    <time className="shrink-0 text-xs text-slate-400">{formatDateTime(ci.created_at)}</time>
                  </div>
                  {(ci.ship_name || ci.cruise_name || ci.port) && (
                    <p className="mt-2 text-xs text-slate-500">
                      {[ci.ship_name, ci.cruise_name, ci.port].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {ci.location_description && (
                    <p className="mt-1 text-xs text-slate-500">📍 {ci.location_description}</p>
                  )}
                  {ci.note && <p className="mt-2 text-sm italic text-slate-600">&ldquo;{ci.note}&rdquo;</p>}
                  {ci.photo_url && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ci.photo_url}
                        alt=""
                        className="max-h-48 w-full max-w-sm rounded-xl border border-slate-200 object-cover"
                      />
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <JourneyMapPlaceholder hints={locationHints} />
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">
        Hosted on {BRAND.name} · {BRAND.tagline}
      </p>
    </div>
  );
}
