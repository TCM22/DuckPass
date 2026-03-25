'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { safeAppPath } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { ensureProfile } from '@/lib/auth/ensure-profile';
import { AuthBrandMark } from '@/components/auth/auth-brand-mark';
import { getAuthSiteOrigin } from '@/lib/site-url';

export default function SignupForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterSignup = safeAppPath(searchParams.get('redirect'), '/dashboard');
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setFormError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);

    try {
      const emailTrimmed = email.trim();
      const siteUrl = getAuthSiteOrigin();

      const { data, error } = await supabase.auth.signUp({
        email: emailTrimmed,
        password,
        options: {
          data: { display_name: displayName.trim() },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        console.error('[signup] signUp error', error.message, error);
        const displayError =
          /rate limit/i.test(error.message)
            ? 'Too many confirmation emails were sent from this project. Wait 30–60 minutes and try again, or in Supabase go to Authentication → Rate Limits / Providers → Email (you can turn off “Confirm email” while testing locally).'
            : error.message;
        setFormError(displayError);
        toast.error(displayError);
        setLoading(false);
        return;
      }

      if (!data.user) {
        const msg = 'Could not create account. Try again or use a different email.';
        console.error('[signup] missing user in response');
        setFormError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      if (data.session) {
        await ensureProfile(supabase);
        toast.success('Welcome! Your account is ready.');
        router.push(afterSignup);
        router.refresh();
      } else {
        toast.success('Check your email to confirm your account, then log in.');
        router.push('/login?notice=confirm-email');
      }
    } catch (err) {
      console.error('[signup] unexpected error', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 left-1/2 h-72 w-[28rem] -translate-x-1/2 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
      </div>
      <div className="relative flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md border-amber-100/90 shadow-[var(--shadow-cq-lg)]">
          <AuthBrandMark />
          <div className="-mt-1 mb-7 text-center">
            <h1 className="cq-heading text-2xl font-semibold text-slate-900">Create your account</h1>
            <p className="mt-1 text-slate-500">Issue passports and track finds from day one</p>
          </div>

          {formError && (
            <p
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
              role="alert"
            >
              {formError}
            </p>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <Input
              id="displayName"
              label="Display Name"
              placeholder="e.g. Captain Avery"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-amber-700 hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
