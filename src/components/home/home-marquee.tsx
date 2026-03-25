const PHRASES = [
  'Trackable ducks',
  'QR passports',
  'Cruise finds',
  'Rehidden at sea',
  'Found ship to shore',
  'No app required for finders',
] as const;

const phraseClass =
  'shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 sm:text-xs sm:tracking-[0.18em] md:tracking-[0.2em]';

export function HomeMarquee() {
  return (
    <div
      className="cq-marquee-group hidden min-w-0 max-w-full overflow-x-hidden border-b border-amber-200/40 bg-gradient-to-r from-amber-50/95 via-white to-sky-50/90 py-2.5 sm:py-3 md:block"
      aria-hidden
    >
      <div className="cq-marquee-fade relative">
        {/* Mobile: one pass, wrapped — no duplicate chips */}
        <div
          className="cq-marquee-mobile flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-3 sm:gap-x-4 md:hidden"
          aria-hidden
        >
          {PHRASES.map((phrase) => (
            <span key={phrase} className={phraseClass}>
              {phrase}
            </span>
          ))}
        </div>

        {/* Desktop: duplicated loop for seamless infinite scroll */}
        <div className="cq-marquee-track hidden items-center gap-8 sm:gap-12 md:flex md:gap-16">
          {[...PHRASES, ...PHRASES].map((phrase, i) => (
            <span key={`${phrase}-${i}`} className={phraseClass}>
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
