'use client';

import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/components/auth/auth-modal-context';

export function HomeHeroAuthButtons() {
  const { openAuth } = useAuthModal();
  return (
    <div className="mt-10 flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
      <Button
        type="button"
        size="lg"
        className="w-full min-w-0 sm:w-auto sm:min-w-[12.5rem]"
        onClick={() => openAuth('signup')}
      >
        Start with a passport
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full min-w-0 border-slate-300/95 bg-white sm:w-auto sm:min-w-[10rem]"
        onClick={() => openAuth('login')}
      >
        Log in
      </Button>
    </div>
  );
}

export function HomeClosingCta() {
  const { openAuth } = useAuthModal();
  return (
    <div className="mt-10 flex flex-col items-center gap-6">
      <Button
        type="button"
        variant="solidLight"
        size="lg"
        className="w-full max-w-sm px-8 sm:w-auto sm:min-w-[16rem]"
        onClick={() => openAuth('signup')}
      >
        Create your account
      </Button>
      <p className="max-w-md text-center text-sm leading-relaxed text-amber-100/95">
        <span className="text-amber-50/95">Already have an account?</span>{' '}
        <button
          type="button"
          onClick={() => openAuth('login')}
          className="font-semibold text-white underline decoration-amber-200/80 underline-offset-4 transition-colors hover:decoration-white"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
