'use client';

import { AuthModalProvider } from '@/components/auth/auth-modal-context';
import { RegisterServiceWorker } from '@/components/pwa/register-sw';
import { Toaster } from '@/components/providers/toaster';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthModalProvider>
      <RegisterServiceWorker />
      {children}
      <Toaster />
    </AuthModalProvider>
  );
}
