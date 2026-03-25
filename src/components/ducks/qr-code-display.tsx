'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';

interface Props {
  url: string;
  duckName: string;
}

export function QRCodeDisplay({ url, duckName }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const target = url.trim();
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      if (!target) {
        setQrDataUrl(null);
        setFailed(true);
        return;
      }
      setFailed(false);
      setQrDataUrl(null);
      QRCode.toDataURL(target, {
        width: 280,
        margin: 2,
        color: { dark: '#1f2937', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
        .then((data) => {
          if (!cancelled) setQrDataUrl(data);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    };

    queueMicrotask(run);

    return () => {
      cancelled = true;
    };
  }, [url]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `duckpass-${duckName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (failed) {
    return (
      <p className="mx-auto max-w-[280px] rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-6 text-sm text-amber-900">
        Couldn&apos;t generate the QR image. Copy the link above instead—it&apos;s the same address.
      </p>
    );
  }

  if (!qrDataUrl) {
    return <div className="mx-auto h-[280px] w-[280px] animate-pulse rounded-xl bg-slate-100" />;
  }

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`QR code for ${duckName}`}
        className="mx-auto rounded-xl"
        width={280}
        height={280}
      />
      <Button variant="outline" size="sm" onClick={handleDownload} className="mt-4 w-full max-w-[280px]">
        Download QR image
      </Button>
    </div>
  );
}
