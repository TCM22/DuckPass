import Link from 'next/link';
import { BackToDashboardButton } from '@/components/ui/back-to-dashboard-button';
import { linkButtonClass } from '@/lib/button-styles';
import { cn } from '@/lib/utils';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <BackToDashboardButton className="mb-6" />
      <div className="mb-6 flex gap-2 border-b border-slate-200/90 pb-4">
        <Link
          href="/account/settings"
          className={cn(
            linkButtonClass('ghost', 'sm', 'text-slate-600'),
            'font-semibold text-amber-800 hover:text-amber-900'
          )}
        >
          Account settings
        </Link>
      </div>
      {children}
    </div>
  );
}
