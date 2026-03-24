import { Card } from '@/components/ui/card';
import { timeAgo, ACTION_LABELS } from '@/lib/utils';
import type { CheckIn, Duck } from '@/lib/types';

interface Props {
  checkIns: CheckIn[];
  ducks: Duck[];
}

export function RecentCheckIns({ checkIns, ducks }: Props) {
  const duckMap = new Map(ducks.map((d) => [d.id, d]));

  return (
    <div className="space-y-3">
      {checkIns.map((ci) => {
        const duck = duckMap.get(ci.duck_id);
        return (
          <Card
            key={ci.id}
            className="border-slate-100/90 py-4 transition-colors hover:border-amber-200/60 hover:bg-amber-50/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-sm font-semibold text-slate-900">
                  {ci.finder_name || 'Anonymous'}
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  {ACTION_LABELS[ci.action] || ci.action}
                </span>
                {duck && (
                  <span className="mt-1 block min-w-0 wrap-break-word text-sm leading-snug text-slate-400 sm:mt-0 sm:inline sm:ml-1 sm:max-w-none">
                    &ldquo;{duck.name}&rdquo;
                  </span>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {timeAgo(ci.created_at)}
              </span>
            </div>
            {(ci.ship_name || ci.port) && (
              <div className="mt-2 text-xs text-slate-500">
                {ci.ship_name && <span>🚢 {ci.ship_name}</span>}
                {ci.port && <span className="ml-3">⚓ {ci.port}</span>}
              </div>
            )}
            {ci.photo_url && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ci.photo_url}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                />
              </div>
            )}
            {ci.note && (
              <p className="mt-2 border-l-2 border-amber-300/80 pl-3 text-sm italic text-slate-600">
                &ldquo;{ci.note}&rdquo;
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
