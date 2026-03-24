import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6 border-b border-slate-200/80 pb-5 sm:mb-8 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700/90 sm:text-xs sm:tracking-[0.2em]">
              Admin
            </p>
            <h1 className="cq-heading text-xl font-semibold leading-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Overview
            </h1>
            <p className="text-sm text-slate-500 sm:hidden">Platform stats and moderation</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-sky-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 active:bg-slate-100 sm:min-h-0 sm:py-2.5"
          >
            ← Back to dashboard
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
