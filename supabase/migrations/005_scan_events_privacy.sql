-- Privacy-conscious scan metadata (optional). Raw IP not required for new inserts.

alter table public.scan_events
  add column if not exists ip_hash text;

alter table public.scan_events
  add column if not exists geo_hint jsonb;

comment on column public.scan_events.ip_hash is 'SHA-256 (truncated) of client IP + server salt — not reversible to exact IP.';
comment on column public.scan_events.geo_hint is 'Optional coarse location from future IP lookup (country/region); approximate only.';

-- scanned_at equivalent: use existing created_at
