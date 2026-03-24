import { createClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: row } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    isAdmin = row?.role === 'admin';
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="shrink-0 lg:w-56">
          <div className="rounded-2xl border border-amber-100/90 bg-white/75 p-4 shadow-[var(--shadow-cq-md)] backdrop-blur-sm lg:sticky lg:top-24">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">DuckPass</p>
            <DashboardNav isAdmin={isAdmin} />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
