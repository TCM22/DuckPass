import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-amber-100/90 bg-gradient-to-b from-white to-amber-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-sky-100 text-xl shadow-sm ring-1 ring-amber-200/50">
              🦆
            </span>
            <div>
              <span className="cq-heading block text-lg font-semibold text-slate-900">{BRAND.name}</span>
              <span className="text-sm text-slate-500">{BRAND.tagline}</span>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="transition-colors hover:text-amber-700">
              Home
            </Link>
            <Link href="/login" className="transition-colors hover:text-amber-700">
              Log in
            </Link>
            <Link href="/signup" className="transition-colors hover:text-amber-700">
              Sign up
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {BRAND.name}. Passports for ducks that travel.
        </p>
      </div>
    </footer>
  );
}
