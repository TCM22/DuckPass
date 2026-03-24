'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function AccountSuspendedPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-16">
      <Card variant="outlined" className="border-amber-200/80 p-6 text-center sm:p-8">
        <p className="text-3xl" aria-hidden>
          ⛔
        </p>
        <h1 className="cq-heading mt-4 text-xl font-semibold text-slate-900">Account paused</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Your DuckPass sign-in is active, but dashboard access is turned off for this account. If you think this is a
          mistake, contact support.
        </p>
        <Button type="button" variant="primary" className="mt-6 w-full" onClick={handleSignOut}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}
