'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { AuthBrandMark } from '@/components/auth/auth-brand-mark';
import { getPasswordRecoveryRedirectUrl } from '@/lib/site-url';
import { linkButtonClass } from '@/lib/button-styles';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setFormError('Enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
        redirectTo: getPasswordRecoveryRedirectUrl(),
      });
      if (error) {
        setFormError(error.message);
        toast.error(error.message);
        return;
      }
      setSent(true);
      toast.success('If that email is registered, you will receive reset instructions shortly.');
    } catch (err) {
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
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-sky-200/25 blur-3xl" />
      </div>
      <div className="relative flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md border-amber-100/90 shadow-[var(--shadow-cq-lg)]">
          <AuthBrandMark />
          <div className="-mt-1 mb-7 text-center">
            <h1 className="cq-heading text-2xl font-semibold text-slate-900">Reset your password</h1>
            <p className="mt-1 text-slate-500">We&apos;ll email you a link to choose a new password</p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                Check your inbox for an email from us. Open the link, then you&apos;ll be able to set a new password on
                DuckPass. If nothing arrives in a few minutes, check spam or try again with the same email you use to
                log in.
              </p>
              <Link href="/login" className={linkButtonClass('secondary', 'md', 'block w-full text-center')}>
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              {formError && (
                <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                  {formError}
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="forgot-email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  Send reset link
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500">
                <Link href="/login" className="font-semibold text-amber-700 hover:underline">
                  Back to log in
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
