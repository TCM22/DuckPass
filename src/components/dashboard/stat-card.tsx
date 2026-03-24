import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  accent?: 'amber' | 'sky' | 'teal' | 'slate';
  sublabel?: string;
}

const accents: Record<NonNullable<StatCardProps['accent']>, string> = {
  amber: 'from-amber-50 to-amber-100/50 border-amber-200/50',
  sky: 'from-sky-50 to-sky-100/40 border-sky-200/50',
  teal: 'from-teal-50 to-teal-100/40 border-teal-200/50',
  slate: 'from-slate-50 to-slate-100/40 border-slate-200/50',
};

export function StatCard({ label, value, icon, accent = 'amber', sublabel }: StatCardProps) {
  return (
    <Card
      variant="elevated"
      className={cn(
        'relative overflow-hidden bg-gradient-to-br p-5 sm:p-6',
        accents[accent]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
        </div>
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-2xl shadow-sm ring-1 ring-slate-900/5"
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}
