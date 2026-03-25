import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignupForm from './signup-form';

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center text-slate-400">Loading...</div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
