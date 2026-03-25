'use client';

import toast from 'react-hot-toast';
import { linkButtonClass } from '@/lib/button-styles';
import { cn, getDuckUrl } from '@/lib/utils';

/** Copy full passport URL — uses `getDuckUrl` / `@/lib/site-url` (same rules as server `getPublicSiteUrl` when env is set). */
export function CopyDuckPassportLink({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          const url = getDuckUrl(slug);
          await navigator.clipboard.writeText(url);
          toast.success('Passport link copied');
        } catch {
          toast.error('Could not copy');
        }
      }}
      className={cn(
        linkButtonClass(
          'subtle',
          'sm',
          'w-full min-w-0 text-sky-800 ring-1 ring-slate-200/90 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900'
        ),
        className
      )}
    >
      Copy link
    </button>
  );
}
