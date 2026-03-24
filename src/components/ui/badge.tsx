import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'neutral' | 'sky';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-amber-100 text-amber-900 border-amber-200/80',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
  sky: 'bg-sky-50 text-sky-800 border-sky-200/80',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
