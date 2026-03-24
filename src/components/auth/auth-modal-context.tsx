'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AuthModal } from '@/components/auth/auth-modal';
import type { AuthModalTab } from '@/components/auth/auth-types';

export type { AuthModalTab };

type AuthModalContextValue = {
  openAuth: (tab?: AuthModalTab) => void;
  closeAuth: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>('login');

  const openAuth = useCallback((next?: AuthModalTab) => {
    setTab(next ?? 'login');
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openAuth, closeAuth }), [openAuth, closeAuth]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal open={open} onClose={closeAuth} initialTab={tab} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
}
