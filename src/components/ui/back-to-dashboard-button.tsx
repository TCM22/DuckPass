import Link from 'next/link';
import { linkButtonClass } from '@/lib/button-styles';
import { cn } from '@/lib/utils';

export function BackToDashboardButton({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        linkButtonClass('subtle', 'sm', 'w-fit gap-1.5 pl-3 pr-4'),
        className
      )}
    >
      <span aria-hidden className="-ml-0.5 text-lg leading-none text-slate-500">
        ←
      </span>
      Back to dashboard
    </Link>
  );
}
