'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminRemoveStoredPhoto } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Removes the object from the `images` bucket and clears `photo_url` on the row (requires migration 009 policies).
 */
export function AdminRemoveStoredPhotoButton({
  kind,
  rowId,
  className,
}: {
  kind: 'duck' | 'check_in';
  rowId: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={pending}
      disabled={pending}
      title="Delete image from storage and clear the link (moderation)"
      className={cn('text-xs font-semibold text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50', className)}
      onClick={() => {
        if (
          !window.confirm(
            'Remove this photo from storage and the database? This cannot be undone. (Full moderation tools can be added later.)'
          )
        ) {
          return;
        }
        startTransition(async () => {
          const result = await adminRemoveStoredPhoto(kind, rowId);
          if (result.error) {
            window.alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      Remove photo
    </Button>
  );
}
