'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

const MIN_LEN = 6;

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const client = createClient();
    void client.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      setHasSession(Boolean(user));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (password.length < MIN_LEN) {
      setFormError(`Password must be at least ${MIN_LEN} characters.`);
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFormError(error.message);
        toast.error(error.message);
        return;
      }
      toast.success('Password updated. You can continue with your account.');
      router.push('/account/settings?notice=password-reset');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <Card className="border-amber-100/90 p-8 text-center text-slate-500 shadow-[var(--shadow-cq-md)]">
        Checking your session…
      </Card>
    );
  }

  if (!hasSession) {
    return (
      <Card className="border-amber-100/90 p-6 shadow-[var(--shadow-cq-md)]">
        <h1 className="cq-heading text-xl font-semibold text-slate-900">Link expired or invalid</h1>
        <p className="mt-2 text-sm text-slate-600">
          Open the reset link from your email again, or request a new one. This page only works right after you use the
          link from your inbox.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="primary" className="flex-1" onClick={() => router.push('/forgot-password')}>
            Request new link
          </Button>
          <Button type="button" variant="subtle" className="flex-1" onClick={() => router.push('/login')}>
            Log in
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-amber-100/90 p-6 shadow-[var(--shadow-cq-md)]">
      <h1 className="cq-heading text-xl font-semibold text-slate-900">Choose a new password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter a new password for your account. After saving, you&apos;ll stay signed in.
      </p>

      {formError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          id="reset-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={MIN_LEN}
        />
        <Input
          id="reset-password-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={MIN_LEN}
        />
        <Button type="submit" loading={loading} className="w-full">
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-amber-700 hover:underline">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
