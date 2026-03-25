import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { BackToDashboardButton } from '@/components/ui/back-to-dashboard-button';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublicSiteUrl } from '@/lib/request-origin';
import { getDuckUrl, STATUS_LABELS } from '@/lib/utils';
import { DuckSetupSuccess } from '@/components/ducks/duck-setup-success';
import { DuckDetailsFields } from '@/components/ducks/duck-details-fields';
import { QrCardWithCopy } from '@/components/ducks/qr-card-with-copy';
import { QrPhysicalTagHelp } from '@/components/ducks/qr-tag-help';
import { RecentCheckIns } from '@/components/ducks/recent-check-ins';
import { DuckManagePhotoCard } from '@/components/ducks/duck-manage-photo-card';
import type { Duck } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DuckManagePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const justCreated = sp['new'] === '1' || sp['new'] === 'true';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: duck } = await supabase
    .from('ducks')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!duck || duck.owner_id !== user.id) notFound();

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('duck_id', duck.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const publicUrl = getDuckUrl(duck.slug, await getPublicSiteUrl());

  const detailsCard = (
    <Card>
      <h2 className="cq-heading text-lg font-semibold text-slate-900 mb-4">Duck details</h2>
      <DuckDetailsFields
        description={duck.description}
        launch_ship={duck.launch_ship}
        launch_cruise={duck.launch_cruise}
        launch_port={duck.launch_port}
        launch_date={duck.launch_date}
        created_at={duck.created_at}
      />
    </Card>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <BackToDashboardButton className="mb-4" />

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="cq-heading text-3xl font-semibold text-slate-900 flex items-center gap-2">
            🦆 {duck.name}
          </h1>
          <p className="text-slate-500 mt-1">
            {STATUS_LABELS[duck.status]} · {duck.check_in_count} check-in{duck.check_in_count !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/duck/${duck.slug}`} target="_blank">
          <Button variant="secondary" size="sm">View Public Page ↗</Button>
        </Link>
      </div>

      {justCreated ? (
        <>
          <div className="mb-8">
            <DuckSetupSuccess duckName={duck.name} publicUrl={publicUrl} slug={duck.slug} />
          </div>
          <div className="mb-6">
            <DuckManagePhotoCard duckId={duck.id} userId={user.id} initialPhotoUrl={duck.photo_url} />
          </div>
          <div className="mb-8">{detailsCard}</div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <DuckManagePhotoCard duckId={duck.id} userId={user.id} initialPhotoUrl={duck.photo_url} />
          </div>
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <QrCardWithCopy publicUrl={publicUrl} duckName={duck.name} slug={duck.slug} />
            {detailsCard}
          </div>
        </>
      )}

      <div className="mb-8">
        <QrPhysicalTagHelp />
      </div>

      <div>
        <h2 className="cq-heading text-xl font-semibold text-slate-900 mb-4">Check-in history</h2>
        {!checkIns || checkIns.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-slate-500">No check-ins yet. Once your tag is on the duck, finders can scan and log a find.</p>
          </Card>
        ) : (
          <RecentCheckIns checkIns={checkIns} ducks={[duck as Duck]} />
        )}
      </div>
    </div>
  );
}
