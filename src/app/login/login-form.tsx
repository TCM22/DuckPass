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

function decodeAuthMsg(raw: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    return raw;
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeAppPath(searchParams.get('redirect'), '/dashboard');
  const notice = searchParams.get('notice');
  const authError = searchParams.get('error');
  const authMsg = searchParams.get('auth_msg');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      const emailTrimmed = email.trim();

      const { error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });

      if (error) {
        console.error('[login] signInWithPassword error', error.message, error);
        setFormError(error.message);
        toast.error(error.message);
        return;
      }

      await ensureProfile(supabase);

      toast.success('Welcome back!');
      router.push(redirect);
      router.refresh();
    } catch (err) {
      console.error('[login] unexpected error', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-amber-100/90 shadow-[var(--shadow-cq-lg)]">
      <AuthBrandMark />
      <div className="-mt-1 mb-7 text-center">
        <h1 className="cq-heading text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-slate-500">Sign in to your passport desk</p>
      </div>

      {notice === 'confirm-email' && (
        <p className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Confirm your email using the link we sent, then sign in below.
        </p>
      )}

      {authError === 'auth' && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {authMsg
            ? decodeAuthMsg(authMsg)
            : 'Sign-in link expired or invalid. Request a new one from sign up, or try logging in with your password.'}
        </p>
      )}

      {formError && (
        <p
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {formError}
        </p>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-amber-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Log In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-amber-700 hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
