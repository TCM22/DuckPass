import { formatDate } from '@/lib/utils';

/** Shared duck detail rows for manage page (server-safe). */
export function DuckDetailsFields({
  description,
  launch_ship,
  launch_cruise,
  launch_port,
  launch_date,
  created_at,
}: {
  description: string | null | undefined;
  launch_ship: string | null | undefined;
  launch_cruise: string | null | undefined;
  launch_port: string | null | undefined;
  launch_date: string | null | undefined;
  created_at: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      {description && (
        <div>
          <span className="text-slate-400">Story:</span>
          <p className="text-slate-700 mt-1">{description}</p>
        </div>
      )}
      {launch_ship && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Ship</span>
          <span className="text-slate-700 text-right">{launch_ship}</span>
        </div>
      )}
      {launch_cruise && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Voyage</span>
          <span className="text-slate-700 text-right">{launch_cruise}</span>
        </div>
      )}
      {launch_port && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Port</span>
          <span className="text-slate-700 text-right">{launch_port}</span>
        </div>
      )}
      {launch_date && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Launch Date</span>
          <span className="text-slate-700">{formatDate(launch_date)}</span>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Registered</span>
        <span className="text-slate-700">{formatDate(created_at)}</span>
      </div>
    </div>
  );
}
