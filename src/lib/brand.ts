/** Shared product copy — use for metadata and visible branding. */
export const BRAND = {
  name: 'DuckPass',
  tagline: 'Give Every Duck a Passport',
  /** Default browser tab / SEO title */
  fullTitle: 'DuckPass — Give Every Duck a Passport',
  metaDescription:
    'Register trackable ducks, attach QR or NFC tags, and let finders log finds—no account required. Track every passport and journey.',
} as const;

export function duckPublicTitle(duckName: string) {
  return `${duckName} — Duck Passport · ${BRAND.name}`;
}

export function duckPublicDescription(duckName: string, description: string | null) {
  return (
    description ||
    `Follow ${duckName}'s journey on ${BRAND.name}. Scan the QR or tap NFC to log a find.`
  );
}
