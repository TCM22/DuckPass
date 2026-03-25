'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BRAND } from '@/lib/brand';
import { ensureProfile } from '@/lib/auth/ensure-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { AuthModalTab } from '@/components/auth/auth-types';
import { getAuthSiteOrigin } from '@/lib/site-url';

type Props = {
  open: boolean;
  onClose: () => void;
  initialTab: AuthModalTab;
};

export function AuthModal({ open, onClose, initialTab }: Props) {
  const titleId = useId();
  const [view, setView] = useState<AuthModalTab>(initialTab);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset tab when modal opens with a new default
      setView(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-amber-100/90 bg-white shadow-[var(--shadow-cq-lg)] sm:rounded-2xl'
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div>
            <p id={titleId} className="cq-heading text-lg font-semibold text-slate-900">
              {BRAND.name}
            </p>
            <p className="text-xs text-slate-500">{BRAND.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-slate-100 px-3 pt-2 sm:px-4">
          <TabButton active={view === 'login'} onClick={() => setView('login')}>
            Log in
          </TabButton>
          <TabButton active={view === 'signup'} onClick={() => setView('signup')}>
            Sign up
          </TabButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {view === 'login' ? (
            <ModalLoginForm onSuccess={onClose} />
          ) : (
            <ModalSignupForm onSuccess={onClose} />
          )}
          <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Prefer the full page?{' '}
            <Link href={view === 'login' ? '/login' : '/signup'} className="font-semibold text-amber-700 hover:underline" onClick={onClose}>
              Open {view === 'login' ? 'login' : 'sign up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-t-lg px-3 py-2.5 text-sm font-semibold transition-colors sm:py-2',
        active
          ? 'bg-white text-amber-900 ring-1 ring-slate-200/80 ring-b-0'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      )}
    >
      {children}
    </button>
  );
}

function ModalLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
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
        setFormError(error.message);
        toast.error(error.message);
        return;
      }
      await ensureProfile(supabase);
      toast.success('Welcome back!');
      onSuccess();
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">Sign in to your passport desk.</p>
      {formError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {formError}
        </p>
      )}
      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          id="modal-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="modal-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-amber-700 hover:underline"
            onClick={onSuccess}
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="md">
          Log in
        </Button>
      </form>
    </div>
  );
}

function ModalSignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
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
        const displayError =
          /rate limit/i.test(error.message)
            ? 'Too many confirmation emails. Wait a bit or adjust email settings in Supabase.'
            : error.message;
        setFormError(displayError);
        toast.error(displayError);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setFormError('Could not create account. Try again.');
        setLoading(false);
        return;
      }
      if (data.session) {
        await ensureProfile(supabase);
        toast.success('Welcome! Your account is ready.');
        onSuccess();
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.success('Check your email to confirm, then log in.');
        onSuccess();
        router.push('/login?notice=confirm-email');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">Create an account to issue passports and track finds.</p>
      {formError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {formError}
        </p>
      )}
      <form onSubmit={handleSignup} className="space-y-5">
        <Input
          id="modal-display"
          label="Display name"
          placeholder="e.g. Captain Avery"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <Input
          id="modal-signup-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="modal-signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Button type="submit" loading={loading} className="w-full" size="md">
          Create account
        </Button>
      </form>
    </div>
  );
}
