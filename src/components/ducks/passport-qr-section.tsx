'use client';

import { Card } from '@/components/ui/card';
import { QRCodeDisplay } from '@/components/ducks/qr-code-display';

type Props = {
  publicUrl: string;
  duckName: string;
  /** Owner manage page: tag/print copy. Public passport: short finder-focused copy. */
  context?: 'owner' | 'public';
};

export function PassportQrSection({ publicUrl, duckName, context = 'owner' }: Props) {
  const isPublic = context === 'public';

  return (
    <Card className="text-center">
      <h2 className="cq-heading text-lg font-semibold text-slate-900">QR code</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {isPublic ? (
          <>Scan to open this passport—the same URL as below.</>
        ) : (
          <>
            This QR encodes the same URL as above. Print it or save the image, then{' '}
            <strong className="font-medium text-slate-800">attach it to your duck</strong> with a tag, sticker, or
            keychain so finders can scan.
          </>
        )}
      </p>
      <div className="mt-5">
        <QRCodeDisplay url={publicUrl} duckName={duckName} />
      </div>
    </Card>
  );
}
