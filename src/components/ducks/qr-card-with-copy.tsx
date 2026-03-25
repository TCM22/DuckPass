'use client';

import { PublicPassportShare } from '@/components/ducks/public-passport-share';
import { PassportQrSection } from '@/components/ducks/passport-qr-section';

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
      <PassportQrSection publicUrl={publicUrl} duckName={duckName} context="owner" />
    </div>
  );
}
