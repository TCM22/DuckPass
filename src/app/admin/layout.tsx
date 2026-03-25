import { BackToDashboardButton } from '@/components/ui/back-to-dashboard-button';

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
          <BackToDashboardButton className="sm:pb-0.5" />
        </div>
      </header>
      {children}
    </div>
  );
}
