'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { DuckPhotoUploadField } from '@/components/ducks/duck-photo-upload-field';

export function DuckManagePhotoCard({
  duckId,
  userId,
  initialPhotoUrl,
}: {
  duckId: string;
  userId: string;
  initialPhotoUrl: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);

  useEffect(() => {
    setPhotoUrl(initialPhotoUrl);
  }, [initialPhotoUrl]);

  return (
    <Card>
      <h2 className="cq-heading text-lg font-semibold text-slate-900 mb-1">Passport photo</h2>
      <p className="mb-4 text-sm text-slate-600">
        This image appears on your public duck page. Square photos look best.
      </p>
      <DuckPhotoUploadField
        supabase={supabase}
        userId={userId}
        duckId={duckId}
        currentUrl={photoUrl}
        onUploaded={(url) => {
          setPhotoUrl(url);
          router.refresh();
        }}
        onRemoved={() => {
          setPhotoUrl(null);
          router.refresh();
        }}
      />
    </Card>
  );
}
