import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  /** Short checklist lines under description (hero variant) */
  hints?: string[];
  action?: ReactNode;
  /** Larger branded layout for dashboard */
  variant?: 'default' | 'hero';
  className?: string;
}

export function EmptyState({
  icon = '🦆',
  title,
  description,
  hints,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  if (variant === 'hero') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white to-sky-50/80 px-6 py-14 sm:px-12 sm:py-16 text-center shadow-[var(--shadow-cq-lg)]',
          className
        )}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-sky-200/25 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 text-4xl shadow-md ring-1 ring-amber-200/50 sm:h-24 sm:w-24 sm:text-5xl">
            {icon}
          </div>
          <h3 className="cq-heading mb-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h3>
          {description && (
            <p className="mx-auto mb-6 max-w-lg text-base leading-relaxed text-slate-600">{description}</p>
          )}
          {hints && hints.length > 0 && (
            <ul className="mx-auto mb-8 max-w-md space-y-2 text-left text-sm text-slate-600">
              {hints.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-amber-600" aria-hidden>
                    ✓
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
          {action && <div className="flex flex-wrap justify-center gap-3 sm:gap-4">{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('text-center py-16 px-6', className)}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      {description && <p className="text-slate-500 mb-6 max-w-md mx-auto">{description}</p>}
      {action}
    </div>
  );
}
