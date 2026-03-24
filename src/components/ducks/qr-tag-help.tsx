/** Print & attach guidance for physical QR tags. */
export function QrPhysicalTagHelp() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-[var(--shadow-cq-sm)] sm:p-6">
      <h2 className="cq-heading text-base font-semibold text-slate-900">Print &amp; attach your QR</h2>
      <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-600">
        <li className="flex gap-2">
          <span className="text-amber-600" aria-hidden>
            ·
          </span>
          <span>
            <strong className="font-medium text-slate-800">Print</strong> — download the QR image above, then print it
            on paper or a small label at home or at a copy shop.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-amber-600" aria-hidden>
            ·
          </span>
          <span>
            <strong className="font-medium text-slate-800">Attach</strong> — use a luggage tag, waterproof sticker,
            or keychain ring so the code stays with your duck.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-amber-600" aria-hidden>
            ·
          </span>
          <span>
            <strong className="font-medium text-slate-800">Outdoors &amp; pools</strong> — waterproof tags or laminated
            labels last longer than plain paper.
          </span>
        </li>
      </ul>
      <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
        Official DuckPass tags coming soon
      </p>
    </div>
  );
}
