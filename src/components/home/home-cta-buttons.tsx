'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { linkButtonClass } from '@/lib/button-styles';
import { useAuthModal } from '@/components/auth/auth-modal-context';

type CtaProps = {
  isLoggedIn?: boolean;
};

export function HomeHeroAuthButtons({ isLoggedIn = false }: CtaProps) {
  const { openAuth } = useAuthModal();

  if (isLoggedIn) {
    return (
      <div className="mt-10 flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
        <Link
          href="/dashboard/ducks/new"
          className={linkButtonClass('primary', 'lg', 'inline-flex w-full min-w-0 justify-center sm:w-auto sm:min-w-[12.5rem]')}
        >
          Start with a passport
        </Link>
        <Link
          href="/dashboard"
          className={linkButtonClass(
            'outline',
            'lg',
            'inline-flex w-full min-w-0 justify-center border-slate-300/95 bg-white sm:w-auto sm:min-w-[10rem]'
          )}
        >
          Dashboard
        </Link>
      </div>
    );
  }

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

export function HomeClosingCta({ isLoggedIn = false }: CtaProps) {
  const { openAuth } = useAuthModal();

  if (isLoggedIn) {
    return (
      <div className="mt-10 flex flex-col items-center gap-6">
        <Link
          href="/dashboard"
          className={linkButtonClass('solidLight', 'lg', 'inline-flex w-full max-w-sm justify-center px-8 sm:w-auto sm:min-w-[16rem]')}
        >
          Open dashboard
        </Link>
        <p className="max-w-md text-center text-sm leading-relaxed text-amber-100/95">
          <span className="text-amber-50/95">Want another passport?</span>{' '}
          <Link
            href="/dashboard/ducks/new"
            className="font-semibold text-white underline decoration-amber-200/80 underline-offset-4 transition-colors hover:decoration-white"
          >
            Register a duck
          </Link>
        </p>
      </div>
    );
  }

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
