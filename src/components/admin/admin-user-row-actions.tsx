'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserAdmin } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AdminUserRowActions({
  userId,
  role,
  suspended,
  isSelf,
  className,
}: {
  userId: string;
  role: 'user' | 'admin';
  suspended: boolean;
  isSelf: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ error?: string }>) => {
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  const btnClass = 'w-full min-h-11 justify-center sm:w-auto sm:min-h-10';

  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2',
        className
      )}
    >
      {!isSelf && (
        <Button
          type="button"
          variant="subtle"
          size="sm"
          disabled={pending}
          className={btnClass}
          onClick={() => run(() => updateUserAdmin(userId, { suspended: !suspended }))}
        >
          {suspended ? 'Unsuspend' : 'Suspend'}
        </Button>
      )}
      {!isSelf && role === 'user' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          className={cn(btnClass, 'border-amber-300/90 bg-amber-50/80 text-amber-950 hover:bg-amber-100')}
          onClick={() => {
            if (!window.confirm('Grant admin access to this user?')) return;
            run(() => updateUserAdmin(userId, { role: 'admin' }));
          }}
        >
          Make admin
        </Button>
      )}
      {!isSelf && role === 'admin' && (
        <Button
          type="button"
          variant="subtle"
          size="sm"
          disabled={pending}
          className={btnClass}
          onClick={() => {
            if (!window.confirm('Remove admin role from this user?')) return;
            run(() => updateUserAdmin(userId, { role: 'user' }));
          }}
        >
          Remove admin
        </Button>
      )}
      {isSelf && <span className="py-1 text-xs text-slate-400 sm:py-0">You</span>}
    </div>
  );
}
