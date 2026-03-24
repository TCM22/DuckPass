import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

export type FeaturedDuckCard = {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  launch_ship: string | null;
  launch_cruise: string | null;
  status: string;
  check_in_count: number;
  isPlaceholder?: boolean;
};

const PLACEHOLDER_DUCKS: FeaturedDuckCard[] = [
  {
    id: 'ph-1',
    name: 'Captain Salty',
    slug: '',
    photo_url: null,
    launch_ship: 'Carnival Breeze',
    launch_cruise: 'Western Caribbean',
    status: 'active',
    check_in_count: 12,
    isPlaceholder: true,
  },
  {
    id: 'ph-2',
    name: 'Lido Legend',
    slug: '',
    photo_url: null,
    launch_ship: 'Oasis of the Seas',
    launch_cruise: '7-night Eastern',
    status: 'active',
    check_in_count: 8,
    isPlaceholder: true,
  },
  {
    id: 'ph-3',
    name: 'Deckhand Dot',
    slug: '',
    photo_url: null,
    launch_ship: 'Norwegian Encore',
    launch_cruise: 'Alaska',
    status: 'active',
    check_in_count: 5,
    isPlaceholder: true,
  },
  {
    id: 'ph-4',
    name: 'Poolside Pete',
    slug: '',
    photo_url: null,
    launch_ship: 'Disney Wish',
    launch_cruise: 'Bahamas',
    status: 'active',
    check_in_count: 3,
    isPlaceholder: true,
  },
];

function statusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Active';
    case 'missing':
      return 'Missing';
    case 'retired':
      return 'Retired';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'active':
      return 'bg-teal-50 text-teal-800 ring-teal-200/80';
    case 'missing':
      return 'bg-amber-50 text-amber-900 ring-amber-200/80';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200/80';
  }
}

async function loadFeatured(): Promise<FeaturedDuckCard[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ducks')
      .select('id, name, slug, photo_url, launch_ship, launch_cruise, status, check_in_count')
      .eq('status', 'active')
      .order('check_in_count', { ascending: false })
      .limit(12);

    const rows = (data ?? []) as FeaturedDuckCard[];
    if (rows.length >= 3) {
      return rows.slice(0, 8);
    }
    if (rows.length > 0) {
      const padCount = Math.min(PLACEHOLDER_DUCKS.length, Math.max(0, 8 - rows.length));
      const pad = PLACEHOLDER_DUCKS.slice(0, padCount);
      return [...rows, ...pad];
    }
    return PLACEHOLDER_DUCKS.slice(0, 8);
  } catch {
    return PLACEHOLDER_DUCKS.slice(0, 8);
  }
}

function FeaturedCard({ duck }: { duck: FeaturedDuckCard }) {
  const voyage = [duck.launch_ship, duck.launch_cruise].filter(Boolean).join(' · ') || 'Voyage TBD';

  const cta = duck.isPlaceholder || !duck.slug ? (
    <Link
      href="/signup"
      className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-3 text-sm font-semibold text-white shadow-md shadow-amber-600/25 transition hover:from-amber-500 hover:to-amber-700"
    >
      Start yours
    </Link>
  ) : (
    <Link
      href={`/duck/${duck.slug}`}
      className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border-2 border-amber-400/90 bg-white px-3 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50"
    >
      View passport
    </Link>
  );

  return (
    <article
      className={cn(
        'cq-featured-card flex w-[min(17.5rem,calc(100vw-2.5rem))] sm:w-72 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-amber-100/90 bg-white/95 shadow-[var(--shadow-cq-md)] ring-1 ring-amber-500/5 transition duration-200 hover:border-amber-200/90 hover:shadow-[var(--shadow-cq-lg)]'
      )}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-100/80 via-white to-sky-50/90">
        {duck.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={duck.photo_url}
            alt={`${duck.name} — passport photo`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl opacity-90" aria-hidden>
            🦆
          </div>
        )}
        <span
          className={cn(
            'absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
            statusClass(duck.status)
          )}
        >
          {statusLabel(duck.status)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="cq-heading line-clamp-2 text-lg font-semibold leading-tight text-slate-900">{duck.name}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{voyage}</p>
        <p className="text-xs font-medium text-slate-500">
          <span className="tabular-nums text-slate-700">{duck.check_in_count}</span> finder
          {duck.check_in_count === 1 ? '' : 's'}
        </p>
        {cta}
      </div>
    </article>
  );
}

export function FeaturedDucksRailSkeleton() {
  return (
    <section className="border-b border-slate-100/90 bg-gradient-to-b from-white via-amber-50/15 to-white py-10 sm:py-12 md:py-14">
      <div className="dp-container">
        <div className="mx-auto mb-8 max-w-2xl animate-pulse text-center sm:mb-10">
          <div className="mx-auto h-3 w-28 rounded-full bg-amber-100/80" />
          <div className="mx-auto mt-3 h-9 max-w-xs rounded-lg bg-slate-100" />
          <div className="mx-auto mt-4 h-4 max-w-lg rounded bg-slate-100/90" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden px-4 pb-2 md:px-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[22rem] w-[min(17.5rem,calc(100vw-2.5rem))] shrink-0 animate-pulse rounded-2xl bg-slate-100/80 sm:w-72"
          />
        ))}
      </div>
    </section>
  );
}

export async function FeaturedDucksRail() {
  const items = await loadFeatured();
  const loop = [...items, ...items];

  return (
    <section
      className="relative border-b border-slate-100/90 bg-gradient-to-b from-white via-amber-50/20 to-white py-10 sm:py-12 md:py-14"
      aria-labelledby="featured-ducks-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" aria-hidden />
      <div className="dp-container">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800/80">Passports at sea</p>
          <h2
            id="featured-ducks-heading"
            className="cq-heading mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl md:text-4xl"
          >
            Ducks with stories
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Every passport is a tiny collectible—ships, finds, and the next chapter waiting on deck.
          </p>
        </div>
      </div>

      {/* Mobile / tablet: swipe one row, no duplicated DOM width */}
      <div className="cq-featured-outer relative md:hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#fffefb] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#fffefb] to-transparent" />
        <div className="cq-featured-inner-mobile snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth pb-2 [-webkit-overflow-scrolling:touch] scroll-pl-4 scroll-pr-4">
          <div className="flex w-max gap-3 px-4 pt-0.5">
            {items.map((duck) => (
              <FeaturedCard key={duck.id} duck={duck} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: infinite loop + subtle edge fades */}
      <div className="cq-featured-outer relative hidden md:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#fffefb] to-transparent sm:w-12" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#fffefb] to-transparent sm:w-12" />
        <div className="cq-featured-inner--desktop overflow-x-hidden overflow-y-hidden">
          <div className="cq-featured-track cq-featured-track--loop flex w-max gap-5 px-6 pb-1 pt-0.5 lg:gap-6 lg:px-8">
            {loop.map((duck, i) => (
              <FeaturedCard key={`${duck.id}-${i}`} duck={duck} />
            ))}
          </div>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-lg px-4 text-center text-xs text-slate-500">
        Showing a sample of active passports.{' '}
        <Link href="/signup" className="font-semibold text-sky-700 underline-offset-2 hover:underline">
          Create yours
        </Link>{' '}
        to join the map.
      </p>
    </section>
  );
}
