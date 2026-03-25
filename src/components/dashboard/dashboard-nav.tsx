'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const baseLinks = [
  { href: '/dashboard', label: 'Passports', sub: 'Overview' },
  { href: '/dashboard/ducks/new', label: 'New passport', sub: 'Register a duck' },
  { href: '/account/settings', label: 'Account', sub: 'Email & password' },
] as const;

export function DashboardNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const links = isAdmin
    ? [...baseLinks, { href: '/admin', label: 'Admin', sub: 'Platform' } as const]
    : [...baseLinks];

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {links.map(({ href, label, sub }) => {
        const active =
          href === '/dashboard'
            ? pathname === '/dashboard' ||
              (pathname.startsWith('/dashboard/ducks/') && !pathname.startsWith('/dashboard/ducks/new'))
            : href === '/admin'
              ? pathname.startsWith('/admin')
              : href === '/account/settings'
                ? pathname.startsWith('/account')
                : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex min-h-11 flex-col justify-center rounded-xl px-3 py-2.5 transition-colors',
              active
                ? 'bg-gradient-to-r from-amber-100/90 to-amber-50/80 text-amber-950 ring-1 ring-amber-300/50 shadow-sm'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            )}
          >
            <span className="block text-sm font-semibold">{label}</span>
            <span className="block text-xs font-medium text-slate-500 group-hover:text-slate-600">{sub}</span>
          </Link>
        );
      })}
    </nav>
  );
}
