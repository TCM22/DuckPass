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

  useEffect(() => {
    const target = url.trim();
    if (!target) return;
    QRCode.toDataURL(target, {
      width: 280,
      margin: 2,
      color: { dark: '#1f2937', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl);
  }, [url]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `duckpass-${duckName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (!qrDataUrl) {
    return <div className="w-[280px] h-[280px] bg-gray-100 rounded-xl animate-pulse mx-auto" />;
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
