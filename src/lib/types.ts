export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'premium';
  duck_limit: number;
  /** When true, dashboard routes are blocked (see middleware). */
  suspended?: boolean;
  created_at: string;
  updated_at: string;
}

export type DuckOwnershipSource = 'app' | 'tag_presale' | 'transfer' | 'unclaimed';

export interface Duck {
  id: string;
  /** Null when the duck is not yet claimed (e.g. physical tag inventory). */
  owner_id: string | null;
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'missing' | 'retired' | 'archived';
  launch_ship: string | null;
  launch_cruise: string | null;
  launch_port: string | null;
  launch_date: string | null;
  photo_url: string | null;
  check_in_count: number;
  /** How the duck record was created; supports future tag / claim flows. */
  ownership_source?: DuckOwnershipSource;
  /** When ownership was finalized (backfilled to created_at for app-created ducks). */
  claimed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DuckWithProfile extends Duck {
  profiles: Pick<Profile, 'display_name' | 'avatar_url'> | null;
}

export interface CheckIn {
  id: string;
  duck_id: string;
  finder_name: string;
  finder_email: string | null;
  action: 'found' | 'rehidden' | 'kept' | 'released';
  ship_name: string | null;
  cruise_name: string | null;
  port: string | null;
  location_description: string | null;
  note: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface ScanEvent {
  id: string;
  duck_id: string;
  ip_address: string | null;
  /** Salted hash — not exact IP */
  ip_hash?: string | null;
  user_agent: string | null;
  referer: string | null;
  /** Optional coarse geo from future IP lookup; approximate only */
  geo_hint?: Record<string, unknown> | null;
  created_at: string;
}

export type DuckStatus = Duck['status'];
export type CheckInAction = CheckIn['action'];
export type UserRole = Profile['role'];
export type UserPlan = Profile['plan'];
