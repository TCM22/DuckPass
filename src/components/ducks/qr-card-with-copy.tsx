'use client';

import { Card } from '@/components/ui/card';
import { QRCodeDisplay } from '@/components/ducks/qr-code-display';
import { PublicPassportShare } from '@/components/ducks/public-passport-share';

export function QrCardWithCopy({
  publicUrl,
  duckName,
  slug,
}: {
  publicUrl: string;
  duckName: string;
  slug: string;
}) {
  return (
    <div className="space-y-5">
      <PublicPassportShare publicUrl={publicUrl} slug={slug} duckName={duckName} />

      <Card className="text-center">
        <h2 className="cq-heading text-lg font-semibold text-slate-900">QR code</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This QR encodes the same URL as above. Print it or save the image, then{' '}
          <strong className="font-medium text-slate-800">attach it to your duck</strong> with a tag, sticker, or
          keychain so finders can scan.
        </p>
        <div className="mt-5">
          <QRCodeDisplay url={publicUrl} duckName={duckName} />
        </div>
      </Card>
    </div>
  );
}
