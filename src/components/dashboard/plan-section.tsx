import { Card } from '@/components/ui/card';
import type { UserPlan } from '@/lib/types';

const PRO_FEATURES = [
  'More ducks & higher limits',
  'Advanced tracking & exports',
  'Premium passport styles',
  'Photo galleries per duck',
  'Map & history of finds',
] as const;

export function PlanSection({
  plan,
  duckLimit,
}: {
  plan: UserPlan;
  duckLimit: number;
}) {
  const isPaid = plan === 'pro' || plan === 'premium';
  const planTitle =
    plan === 'premium' ? 'Premium' : plan === 'pro' ? 'Pro' : 'Free';

  return (
    <Card variant="outlined" className="border-amber-200/70 bg-gradient-to-br from-white to-amber-50/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700/80">Your plan</p>
          <h2 className="cq-heading mt-1 text-lg font-semibold text-slate-900">
            {planTitle}
            {!isPaid && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Active
              </span>
            )}
            {isPaid && (
              <span className="ml-2 rounded-full bg-amber-100/90 px-2 py-0.5 text-xs font-medium text-amber-900">
                Active
              </span>
            )}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{duckLimit}</span> ducks on your current plan
            {isPaid ? '.' : ' — upgrade when paid plans launch.'}
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-amber-300/80 bg-white/80 px-4 py-3 text-sm">
          <p className="font-semibold text-amber-900">Upgrade — coming soon</p>
          <p className="mt-1 text-xs text-slate-600">Stripe checkout will be wired here. No charge yet.</p>
        </div>
      </div>
      <div className="mt-5 border-t border-amber-100/80 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">On the roadmap</p>
        <ul className="mt-2 grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-amber-500" aria-hidden>
                ◆
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
