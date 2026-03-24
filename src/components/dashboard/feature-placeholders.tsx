import { Card } from '@/components/ui/card';

function PlaceholderCard({
  title,
  description,
  icon,
  comingSoon,
}: {
  title: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}) {
  return (
    <Card className="relative h-full overflow-hidden border border-dashed border-slate-200/90 bg-gradient-to-br from-white/60 to-slate-50/40 p-5">
      {comingSoon && (
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Soon
        </span>
      )}
      <div className="mb-3 text-2xl opacity-90">{icon}</div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      <div className="mt-3 h-12 rounded-lg bg-gradient-to-r from-slate-100/80 to-slate-50/50 ring-1 ring-inset ring-slate-200/60" />
    </Card>
  );
}

export function FeaturePlaceholders() {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="cq-heading text-xl font-semibold text-slate-900 sm:text-2xl">Passport experience</h2>
          <p className="text-sm text-slate-500">
            Placeholders for maps, stamps, and ports—wired when we ship the next slice.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlaceholderCard
          icon="🗺️"
          title="Travel map"
          description="Plot finds on a map and replay your duck's route over time."
          comingSoon
        />
        <PlaceholderCard
          icon="⚓"
          title="Ports visited"
          description="Auto-list unique ports from finder check-ins and launch metadata."
          comingSoon
        />
        <PlaceholderCard
          icon="🏅"
          title="Passport stamps"
          description="Collect visual stamps when ducks reach new ships or regions."
          comingSoon
        />
        <PlaceholderCard
          icon="⭐"
          title="Featured duck"
          description="Spotlight one passport on your desk or a future public profile."
          comingSoon
        />
        <PlaceholderCard
          icon="📊"
          title="Journey insights"
          description="Scans, check-ins, and highlights across your passports."
          comingSoon
        />
      </div>
    </section>
  );
}
