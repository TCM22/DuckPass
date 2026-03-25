'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BRAND } from '@/lib/brand';
import { useAuthModal } from '@/components/auth/auth-modal-context';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-amber-100/80 bg-white/90 shadow-[var(--shadow-cq-sm)] backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:min-h-16 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 font-semibold text-slate-900 transition-opacity hover:opacity-90"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-xl shadow-md shadow-amber-600/20 ring-2 ring-white">
            🦆
          </span>
          <span className="cq-heading truncate text-lg tracking-tight sm:text-xl">{BRAND.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex md:gap-2" aria-label="Main">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-amber-50 hover:text-amber-900 min-[900px]:px-4"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/ducks/new"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-amber-50 hover:text-amber-900 min-[900px]:px-4"
              >
                Register duck
              </Link>
              <Link
                href="/account/settings"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-amber-50 hover:text-amber-900 min-[900px]:px-4"
              >
                Account
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-0.5 shrink-0">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => openAuth('login')} className="font-semibold">
                Log in
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => openAuth('signup')}>
                Sign up
              </Button>
            </>
          )}
        </nav>

        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-amber-50 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-amber-100/80 bg-white/98 px-4 py-3 shadow-inner md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl px-3 py-3.5 text-base font-medium text-slate-800 hover:bg-amber-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/ducks/new"
                  className="rounded-xl px-3 py-3.5 text-base font-medium text-slate-800 hover:bg-amber-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Register duck
                </Link>
                <Link
                  href="/account/settings"
                  className="rounded-xl px-3 py-3.5 text-base font-medium text-slate-800 hover:bg-amber-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="rounded-xl px-3 py-3.5 text-left text-base font-medium text-slate-500 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-xl px-3 py-3.5 text-left text-base font-medium text-slate-800 hover:bg-amber-50"
                  onClick={() => {
                    setMenuOpen(false);
                    openAuth('login');
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="rounded-xl px-3 py-3.5 text-left text-base font-semibold text-amber-800 hover:bg-amber-50"
                  onClick={() => {
                    setMenuOpen(false);
                    openAuth('signup');
                  }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
