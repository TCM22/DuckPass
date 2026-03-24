'use client';

import { Card } from '@/components/ui/card';
import { QRCodeDisplay } from '@/components/ducks/qr-code-display';
import { PublicPassportShare } from '@/components/ducks/public-passport-share';
import { cn } from '@/lib/utils';

export function DuckSetupSuccess({
  duckName,
  publicUrl,
  slug,
}: {
  duckName: string;
  publicUrl: string;
  slug: string;
}) {
  return (
    <Card
      variant="elevated"
      className={cn(
        'overflow-hidden border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-sky-50/40 p-0'
      )}
    >
      <div className="border-b border-amber-100/80 bg-white/60 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-lg text-white shadow-md"
            aria-hidden
          >
            ✓
          </span>
          <div>
            <p className="cq-heading text-lg font-semibold text-slate-900">Passport ready</p>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{duckName}</span> is live. Use the public link and QR
              below—attach to your duck with a tag, sticker, or keychain.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
        <PublicPassportShare publicUrl={publicUrl} slug={slug} duckName={duckName} compact />

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-5 text-center">
          <p className="mb-1 text-sm font-semibold text-slate-900">QR code</p>
          <p className="mb-4 text-xs text-slate-600">Same URL as above—ready to print or download.</p>
          <QRCodeDisplay url={publicUrl} duckName={duckName} />
        </div>

        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="text-amber-600">·</span>
            <span>
              <strong className="text-slate-800">Download</strong> the QR image and print—or use a waterproof tag on
              deck or pool.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-600">·</span>
            <span>
              <strong className="text-slate-800">Finders</strong> scan without an account; check-ins show in your
              dashboard.
            </span>
          </li>
        </ul>
      </div>
    </Card>
  );
}
