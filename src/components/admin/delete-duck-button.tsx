'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDuckAdmin } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DeleteDuckButton({
  duckId,
  duckName,
  className,
}: {
  duckId: string;
  duckName: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      loading={pending}
      disabled={pending}
      title="Permanently delete this duck"
      className={cn('w-full min-h-11 sm:w-auto sm:min-h-10', className)}
      onClick={() => {
        if (!window.confirm(`Delete duck “${duckName}”? This cannot be undone.`)) return;
        startTransition(async () => {
          const result = await deleteDuckAdmin(duckId);
          if (result.error) {
            window.alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
