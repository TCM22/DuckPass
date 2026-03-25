'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CopyLinkButton } from '@/components/ducks/copy-link-button';
import { linkButtonClass } from '@/lib/button-styles';
import { cn } from '@/lib/utils';

/**
 * Web Share must be detected after mount only. Reading `navigator` during render
 * makes SSR output (no button) differ from the client's first paint (button on
 * supporting devices) and triggers hydration errors.
 */
function NativeShareButton({
  url,
  title,
  text,
  className,
}: {
  url: string;
  title: string;
  text?: string;
  className?: string;
}) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Deferred after paint so server markup matches first client paint (no hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: navigator only on client
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  if (!canShare) return null;

  return (
    <Button
      type="button"
      variant="subtle"
      size="sm"
      className={cn('w-full sm:w-auto', className)}
      onClick={async () => {
        try {
          await navigator.share({ title, text: text ?? title, url });
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }}
    >
      Share…
    </Button>
  );
}

/**
 * Full public URL + copy + open + optional Web Share (mobile).
 * This is the page QR codes resolve to.
 */
export function PublicPassportShare({
  publicUrl,
  duckName,
  className,
  compact = false,
}: {
  publicUrl: string;
  /** Kept for call-site compatibility; visit link uses `publicUrl` so it always matches copy/QR. */
  slug: string;
  duckName: string;
  className?: string;
  /** Tighter layout for inline / stacked contexts */
  compact?: boolean;
}) {
  const shareTitle = `${duckName} — DuckPass`;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-200/90 bg-gradient-to-br from-white via-amber-50/40 to-sky-50/30 shadow-[var(--shadow-cq-sm)]',
        compact ? 'p-4' : 'p-5 sm:p-6',
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800/90">Public passport URL</p>
        <p className="text-sm leading-relaxed text-slate-600">
          Finders open this page when they scan your QR. Copy the link to share in chat or social, or tap{' '}
          <strong className="font-semibold text-slate-800">Visit public page</strong> to preview.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200/95 bg-white px-3 py-3 font-mono text-[13px] leading-snug text-slate-800 shadow-inner wrap-break-word sm:text-sm">
        <span className="select-all">{publicUrl}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <CopyLinkButton url={publicUrl.trim()} label="Copy link" size="sm" variant="primary" className="w-full sm:w-auto" />
        <a
          href={publicUrl.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className={linkButtonClass('secondary', 'sm', 'w-full justify-center sm:w-auto sm:min-w-[11rem]')}
        >
          Visit public page ↗
        </a>
        <NativeShareButton url={publicUrl.trim()} title={shareTitle} text="Open this duck passport on DuckPass" />
      </div>
    </div>
  );
}
