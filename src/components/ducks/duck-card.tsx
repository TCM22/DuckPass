import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { linkButtonClass } from '@/lib/button-styles';
import { BRAND } from '@/lib/brand';
import { CopyDuckPassportLink } from '@/components/ducks/copy-duck-passport-link';
import { STATUS_LABELS, timeAgo } from '@/lib/utils';
import type { Duck } from '@/lib/types';

function statusBadgeVariant(status: Duck['status']): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'missing':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function DuckCard({
  duck,
  lastSeenAt,
}: {
  duck: Duck;
  lastSeenAt?: string | null;
}) {
  const lastSeenLabel =
    duck.check_in_count === 0
      ? 'No sightings yet'
      : lastSeenAt
        ? `Last seen ${timeAgo(lastSeenAt)}`
        : 'Recently active';

  return (
    <Card className="group flex h-full flex-col p-0 overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-cq-lg)] hover:ring-1 hover:ring-amber-300/30">
      <div className="relative bg-gradient-to-r from-amber-400 via-amber-500 to-sky-500 px-4 py-3 sm:px-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Cpath d=\'M10 0v20M0 10h20\' stroke=\'%23ffffff\' stroke-opacity=\'.12\' stroke-width=\'.5\'/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/95">
              {BRAND.name}
            </span>
            <span className="shrink-0 rounded-md bg-white/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
              Passport
            </span>
          </div>
          <Badge variant={statusBadgeVariant(duck.status)} className="border-white/30 bg-white/95 text-xs">
            {STATUS_LABELS[duck.status] || duck.status}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex gap-4">
          {duck.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={duck.photo_url}
              alt=""
              className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-inner ring-1 ring-slate-200/80"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-sky-50 text-3xl shadow-inner ring-1 ring-amber-100/80">
              🦆
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/ducks/${duck.slug}`}
              className="cq-heading text-lg font-semibold text-slate-900 transition-colors hover:text-amber-700"
            >
              {duck.name}
            </Link>
            {duck.description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{duck.description}</p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50/80 px-3.5 py-2.5 ring-1 ring-slate-100/80">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Finds</dt>
            <dd className="mt-0.5 flex min-h-11 items-center font-semibold tabular-nums text-slate-900">
              {duck.check_in_count}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50/80 px-3.5 py-2.5 ring-1 ring-slate-100/80">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last seen</dt>
            <dd
              className="mt-0.5 min-h-11 text-sm font-medium leading-snug text-slate-700 line-clamp-3 wrap-break-word hyphens-auto"
              title={lastSeenLabel}
            >
              {lastSeenLabel}
            </dd>
          </div>
        </dl>

        {duck.launch_ship && (
          <p
            className="mt-4 flex items-start gap-2 text-xs font-medium leading-snug text-slate-600"
            title={duck.launch_ship}
          >
            <span className="mt-0.5 shrink-0" aria-hidden>
              🚢
            </span>
            <span className="line-clamp-2 min-w-0 wrap-break-word">{duck.launch_ship}</span>
          </p>
        )}

        <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/dashboard/ducks/${duck.slug}`} className={linkButtonClass('primary', 'sm', 'min-w-0')}>
              Manage
            </Link>
            <Link
              href={`/duck/${duck.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkButtonClass(
                'secondary',
                'sm',
                'min-w-0 border-0 shadow-md shadow-sky-600/15'
              )}
            >
              Passport ↗
            </Link>
          </div>
          <CopyDuckPassportLink slug={duck.slug} />
        </div>
      </div>
    </Card>
  );
}
