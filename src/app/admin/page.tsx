import Link from 'next/link';
import { StatCard } from '@/components/dashboard/stat-card';
import { DeleteDuckButton } from '@/components/admin/delete-duck-button';
import { AdminUserRowActions } from '@/components/admin/admin-user-row-actions';
import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/admin';
import type { CheckIn, Duck, Profile } from '@/lib/types';
import { ACTION_LABELS } from '@/lib/utils';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default async function AdminPage() {
  const { supabase, user } = await requireAdmin();

  const [
    { count: userCount },
    { count: duckCount },
    { count: findCount },
    { count: scanCount },
    { data: profiles },
    { data: ducks },
    { data: recentCheckIns },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('ducks').select('*', { count: 'exact', head: true }),
    supabase.from('check_ins').select('*', { count: 'exact', head: true }),
    supabase.from('scan_events').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('ducks')
      .select('id, name, slug, owner_id, status, check_in_count, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('check_ins')
      .select('id, duck_id, finder_name, action, ship_name, port, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const ownerIds = [...new Set((ducks || []).map((d) => d.owner_id))];
  let ownerNames = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', ownerIds);
    ownerNames = new Map((owners || []).map((o) => [o.id, o.display_name || '—']));
  }

  const checkInRows = (recentCheckIns || []) as Pick<
    CheckIn,
    'id' | 'duck_id' | 'finder_name' | 'action' | 'ship_name' | 'port' | 'created_at'
  >[];
  const ciDuckIds = [...new Set(checkInRows.map((c) => c.duck_id))];
  let duckMeta = new Map<string, { name: string; slug: string }>();
  if (ciDuckIds.length > 0) {
    const { data: ciDucks } = await supabase
      .from('ducks')
      .select('id, name, slug')
      .in('id', ciDuckIds);
    duckMeta = new Map((ciDucks || []).map((d) => [d.id, { name: d.name, slug: d.slug }]));
  }

  const profileRows = (profiles || []) as Profile[];
  const duckRows = (ducks || []) as Pick<
    Duck,
    'id' | 'name' | 'slug' | 'owner_id' | 'status' | 'check_in_count' | 'created_at'
  >[];

  return (
    <div className="space-y-8 sm:space-y-10">
      <section aria-labelledby="admin-stats-heading">
        <h2 id="admin-stats-heading" className="cq-heading sr-only">
          Totals
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Users" value={userCount ?? 0} icon="👤" accent="slate" />
          <StatCard label="Ducks" value={duckCount ?? 0} icon="🦆" accent="amber" />
          <StatCard label="Finder check-ins" value={findCount ?? 0} icon="📍" accent="teal" />
          <StatCard label="QR scans" value={scanCount ?? 0} icon="📡" accent="sky" />
        </div>
      </section>

      <section aria-labelledby="admin-users-heading" className="space-y-3 sm:space-y-4">
        <h2 id="admin-users-heading" className="cq-heading text-base font-semibold text-slate-900 sm:text-lg">
          Users
        </h2>

        <Card variant="outlined" className="hidden overflow-x-auto p-0 md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profileRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                profileRows.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="max-w-48 px-4 py-3">
                      <span className="block truncate font-medium text-slate-900" title={p.display_name || undefined}>
                        {p.display_name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.role}</td>
                    <td className="px-4 py-3">
                      {p.suspended ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-slate-600">Active</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <AdminUserRowActions
                        userId={p.id}
                        role={p.role}
                        suspended={!!p.suspended}
                        isSelf={p.id === user.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <div className="space-y-3 md:hidden" role="list">
          {profileRows.length === 0 ? (
            <Card variant="outlined" className="p-6 text-center text-slate-500">
              No users found.
            </Card>
          ) : (
            profileRows.map((p) => (
              <Card key={p.id} variant="outlined" className="p-4" role="listitem">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
                    <p className="mt-0.5 truncate text-base font-semibold text-slate-900" title={p.display_name || undefined}>
                      {p.display_name || '—'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-600">
                      <span className="font-medium text-slate-500">Role:</span> {p.role}
                    </span>
                    <span>
                      {p.suspended ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-slate-600">Active</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(p.created_at)}</p>
                  <div className="border-t border-slate-100 pt-3">
                    <AdminUserRowActions
                      userId={p.id}
                      role={p.role}
                      suspended={!!p.suspended}
                      isSelf={p.id === user.id}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <p className="text-xs text-slate-500">
          Showing up to 100 users. Full account deletion stays in Supabase Auth for now.
        </p>
      </section>

      <section aria-labelledby="admin-ducks-heading" className="space-y-3 sm:space-y-4">
        <h2 id="admin-ducks-heading" className="cq-heading text-base font-semibold text-slate-900 sm:text-lg">
          Ducks
        </h2>

        <Card variant="outlined" className="hidden overflow-x-auto p-0 md:block">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Finds</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Public</th>
                <th className="w-36 px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {duckRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No ducks found.
                  </td>
                </tr>
              ) : (
                duckRows.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0">
                    <td className="max-w-56 px-4 py-3">
                      <span className="block truncate font-medium text-slate-900" title={d.name}>
                        {d.name}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-xs text-slate-400" title={`/${d.slug}`}>
                        /{d.slug}
                      </span>
                    </td>
                    <td className="max-w-40 px-4 py-3">
                      <span className="block truncate text-slate-600" title={ownerNames.get(d.owner_id)}>
                        {ownerNames.get(d.owner_id) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.status}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{d.check_in_count}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/duck/${d.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center text-xs font-semibold text-sky-700 hover:underline"
                      >
                        Open ↗
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteDuckButton duckId={d.id} duckName={d.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <div className="space-y-3 md:hidden" role="list">
          {duckRows.length === 0 ? (
            <Card variant="outlined" className="p-6 text-center text-slate-500">
              No ducks found.
            </Card>
          ) : (
            duckRows.map((d) => (
              <Card key={d.id} variant="outlined" className="p-4" role="listitem">
                <div className="space-y-3">
                  <div>
                    <p className="truncate text-base font-semibold text-slate-900" title={d.name}>
                      {d.name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-slate-400" title={`/${d.slug}`}>
                      /{d.slug}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Owner</dt>
                      <dd className="truncate" title={ownerNames.get(d.owner_id)}>
                        {ownerNames.get(d.owner_id) ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Status</dt>
                      <dd>{d.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Finds</dt>
                      <dd className="tabular-nums">{d.check_in_count}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-medium text-slate-500">Created</dt>
                      <dd className="text-xs text-slate-500">{formatDate(d.created_at)}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={`/duck/${d.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-900 hover:bg-sky-100"
                    >
                      Open public passport ↗
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-medium text-slate-500">Danger zone</p>
                    <DeleteDuckButton duckId={d.id} duckName={d.name} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <p className="text-xs text-slate-500">Showing up to 100 ducks, newest first.</p>
      </section>

      <section aria-labelledby="admin-activity-heading" className="space-y-3 sm:space-y-4">
        <h2 id="admin-activity-heading" className="cq-heading text-base font-semibold text-slate-900 sm:text-lg">
          Recent finder activity
        </h2>

        <Card variant="outlined" className="hidden overflow-x-auto p-0 md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Duck</th>
                <th className="px-4 py-3">Finder</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Ship / port</th>
              </tr>
            </thead>
            <tbody>
              {checkInRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No check-ins yet.
                  </td>
                </tr>
              ) : (
                checkInRows.map((c) => {
                  const dm = duckMeta.get(c.duck_id);
                  const shipPort = [c.ship_name, c.port].filter(Boolean).join(' · ') || '—';
                  return (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                      <td className="max-w-48 px-4 py-3">
                        {dm ? (
                          <Link
                            href={`/duck/${dm.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate font-medium text-sky-800 hover:underline"
                            title={dm.name}
                          >
                            {dm.name}
                          </Link>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="max-w-40 px-4 py-3">
                        <span className="block truncate text-slate-700" title={c.finder_name || 'Anonymous'}>
                          {c.finder_name || 'Anonymous'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{ACTION_LABELS[c.action] || c.action}</td>
                      <td className="max-w-[200px] px-4 py-3">
                        <span className="block truncate text-slate-500" title={shipPort !== '—' ? shipPort : undefined}>
                          {shipPort}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>

        <div className="space-y-3 md:hidden" role="list">
          {checkInRows.length === 0 ? (
            <Card variant="outlined" className="p-6 text-center text-slate-500">
              No check-ins yet.
            </Card>
          ) : (
            checkInRows.map((c) => {
              const dm = duckMeta.get(c.duck_id);
              const shipPort = [c.ship_name, c.port].filter(Boolean).join(' · ') || '—';
              return (
                <Card key={c.id} variant="outlined" className="p-4" role="listitem">
                  <p className="text-xs text-slate-500">{formatDate(c.created_at)}</p>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Duck</p>
                      {dm ? (
                        <Link
                          href={`/duck/${dm.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block text-base font-semibold text-sky-800 hover:underline"
                        >
                          {dm.name}
                        </Link>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Finder</p>
                      <p className="truncate text-slate-800" title={c.finder_name || 'Anonymous'}>
                        {c.finder_name || 'Anonymous'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-500">Action:</span>{' '}
                      {ACTION_LABELS[c.action] || c.action}
                    </p>
                    <p className="line-clamp-3 text-sm text-slate-500" title={shipPort !== '—' ? shipPort : undefined}>
                      <span className="font-medium text-slate-500">Ship / port:</span> {shipPort}
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <p className="text-xs text-slate-500">Latest 50 finder check-ins.</p>
      </section>
    </div>
  );
}
