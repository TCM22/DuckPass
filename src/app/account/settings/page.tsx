'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

const MIN_LEN = 6;

function AccountSettingsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notice = searchParams.get('notice');
  const supabase = createClient();

  const [email, setEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const client = createClient();
    void client.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      setEmail(user?.email ?? null);
      setLoadingUser(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    const next = newEmail.trim();
    if (!next) {
      setEmailError('Enter a new email address.');
      return;
    }
    if (next === email) {
      setEmailError('That is already your current email.');
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: next });
      if (error) {
        setEmailError(error.message);
        toast.error(error.message);
        return;
      }
      setEmailSuccess(
        'If your project requires confirming the new address, Supabase will send a message to that inbox. ' +
          'Click the link there to finish the change. Until then, you may still sign in with your previous email.'
      );
      toast.success('Email update requested — check the new inbox if confirmation is required.');
      setNewEmail('');
      void supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) setEmail(user.email);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword.length < MIN_LEN) {
      setPasswordError(`Password must be at least ${MIN_LEN} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
        toast.error(error.message);
        return;
      }
      setPasswordSuccess('Your password has been updated.');
      toast.success('Password updated.');
      setNewPassword('');
      setConfirmPassword('');
      router.replace('/account/settings');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <Card className="border-amber-100/90 p-8 text-center text-slate-500 shadow-[var(--shadow-cq-md)]">
        Loading account…
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {notice === 'password-reset' && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Your password was reset successfully. You can change it again below anytime.
        </p>
      )}

      <Card className="border-amber-100/90 p-6 shadow-[var(--shadow-cq-md)]">
        <h1 className="cq-heading text-xl font-semibold text-slate-900">Account</h1>
        <p className="mt-1 text-sm text-slate-600">Signed in as</p>
        <p className="mt-2 font-mono text-sm font-medium text-slate-800">{email ?? '—'}</p>
      </Card>

      <Card className="border-amber-100/90 p-6 shadow-[var(--shadow-cq-md)]">
        <h2 className="cq-heading text-lg font-semibold text-slate-900">Change email</h2>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;ll send a confirmation to the new address if your Supabase project has secure email change enabled.
          Until you confirm, your login email may stay the same.
        </p>
        {emailError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            {emailError}
          </p>
        )}
        {emailSuccess && (
          <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900" role="status">
            {emailSuccess}
          </p>
        )}
        <form onSubmit={handleEmailChange} className="mt-5 space-y-4">
          <Input
            id="settings-new-email"
            label="New email"
            type="email"
            autoComplete="email"
            placeholder="new@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={emailLoading} variant="secondary" className="w-full sm:w-auto">
            Update email
          </Button>
        </form>
      </Card>

      <Card className="border-amber-100/90 p-6 shadow-[var(--shadow-cq-md)]">
        <h2 className="cq-heading text-lg font-semibold text-slate-900">Change password</h2>
        <p className="mt-2 text-sm text-slate-600">Choose a strong password you haven&apos;t used elsewhere.</p>
        {passwordError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            {passwordError}
          </p>
        )}
        {passwordSuccess && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
            {passwordSuccess}
          </p>
        )}
        <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
          <Input
            id="settings-new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={MIN_LEN}
          />
          <Input
            id="settings-confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={MIN_LEN}
          />
          <Button type="submit" loading={passwordLoading} className="w-full sm:w-auto">
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<Card className="p-8 text-center text-slate-500">Loading…</Card>}>
      <AccountSettingsForm />
    </Suspense>
  );
}
