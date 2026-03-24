import { Suspense } from 'react';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { HomeClosingCta, HomeHeroAuthButtons } from '@/components/home/home-cta-buttons';
import { HomeMarquee } from '@/components/home/home-marquee';
import { FeaturedDucksRail, FeaturedDucksRailSkeleton } from '@/components/home/featured-ducks-rail';

const features = [
  {
    icon: '🎫',
    title: 'Digital passports',
    description:
      'Each duck gets a passport page with story, QR, and a living travel log you control from one dashboard.',
  },
  {
    icon: '📱',
    title: 'QR & NFC',
    description:
      'Generate crisp QR codes for tags and stickers. Ready for NFC taps when you add a chip—same URL, zero friction.',
  },
  {
    icon: '🗺️',
    title: 'Journeys that stick',
    description:
      'Collect finds with ship names, ports, and notes. Your duck\'s timeline becomes the collectible story.',
  },
  {
    icon: '🚢',
    title: 'Ships & ports',
    description:
      'Log launch ship, line, and itinerary so every passport reads like a real voyage—not a generic profile.',
  },
  {
    icon: '⚡',
    title: 'Finders skip signup',
    description:
      'Someone scans or taps? They can log a find in seconds. No account required—just a quick, friendly check-in.',
  },
  {
    icon: '📊',
    title: 'Passport desk',
    description:
      'See every passport, download codes, and track activity in one calm hub—built for owners, friendly for finders.',
  },
];

const cardBase =
  'rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-[var(--shadow-cq-sm)] ring-1 ring-slate-900/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200/90 hover:shadow-[var(--shadow-cq-md)] sm:p-6';

export default function HomePage() {
  return (
    <div>
      <HomeMarquee />

      <section className="relative overflow-hidden border-b border-amber-100/70">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgb(254_243_199/0.55),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_20%,rgb(224_242_254/0.45),transparent_50%),radial-gradient(ellipse_45%_35%_at_0%_80%,rgb(240_253_250/0.5),transparent_45%)]"
          aria-hidden
        />
        <div className="dp-container relative py-12 text-center sm:py-16 md:py-20">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800 shadow-sm backdrop-blur-sm">
            {BRAND.name}
          </p>
          <h1 className="cq-heading text-[clamp(1.75rem,5vw,3.75rem)] font-semibold leading-[1.1] text-slate-900 md:leading-tight">
            Give Every Duck a{' '}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-sky-600 bg-clip-text text-transparent">
              Passport
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg md:text-xl">
            Register ducks, attach QR or NFC, and let finders log finds while you watch the story unfold—ship by
            ship, port by port.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
            Finders can report a sighting without creating an account. You keep the passports; they add the stamps.
          </p>
          <HomeHeroAuthButtons />
        </div>
      </section>

      <Suspense fallback={<FeaturedDucksRailSkeleton />}>
        <FeaturedDucksRail />
      </Suspense>

      <section className="dp-section border-b border-slate-100/90 bg-white">
        <div className="dp-container">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <h2 className="cq-heading text-3xl font-semibold text-slate-900 md:text-4xl">How it works</h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              From new duck to first finder check-in—without the spreadsheet.
            </p>
          </div>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {[
              {
                step: '1',
                icon: '✍️',
                title: 'Register',
                desc: 'Create an account and issue a passport—name, launch ship, and the story you want on the tag.',
              },
              {
                step: '2',
                icon: '📎',
                title: 'Attach QR or NFC',
                desc: 'Download the QR and attach it to your duck (or encode the same URL on an NFC sticker).',
              },
              {
                step: '3',
                icon: '🌍',
                title: 'Track the journey',
                desc: 'Finders scan or tap, log a find, and you see it in your dashboard—timeline included.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={cn(
                  cardBase,
                  'flex flex-col items-center text-center',
                  'border-amber-100/90 bg-gradient-to-b from-white to-amber-50/30'
                )}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-2xl text-white shadow-md shadow-amber-600/25">
                  {item.icon}
                </div>
                <span className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-800/80">
                  Step {item.step}
                </span>
                <h3 className="cq-heading text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-section">
        <div className="dp-container">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <h2 className="cq-heading text-3xl font-semibold text-slate-900 md:text-4xl">Built for collectors</h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Everything you need to run a serious duck program—without feeling like a spreadsheet.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className={cardBase}>
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="cq-heading text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-section relative overflow-hidden border-t border-amber-200/40 bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div className="dp-container relative max-w-3xl text-center">
          <h2 className="cq-heading text-3xl font-semibold text-white md:text-4xl">Ready to stamp the first page?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-amber-50/95">
            Join {BRAND.name} and give your ducks passports that travel. Free to start—your dashboard is waiting.
          </p>
          <HomeClosingCta />
        </div>
      </section>
    </div>
  );
}
