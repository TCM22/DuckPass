import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-shadow duration-200 sm:p-6',
        variant === 'default' &&
          'bg-white/90 backdrop-blur-sm border border-amber-100/60 shadow-[var(--shadow-cq-md)]',
        variant === 'elevated' &&
          'bg-white border border-amber-100/40 shadow-[var(--shadow-cq-lg)] ring-1 ring-amber-500/5',
        variant === 'outlined' && 'border-2 border-slate-200/80 bg-white/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
