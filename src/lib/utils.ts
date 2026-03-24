import { customAlphabet } from 'nanoid';

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const generateId = customAlphabet(alphabet, 8);

export function generateDuckSlug(): string {
  return generateId();
}

/** @param baseUrl Optional origin (e.g. from getPublicSiteUrl) so tunnels match the browser host */
export function getDuckUrl(slug: string, baseUrl?: string): string {
  const base = (baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/duck/${slug}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

export const ACTION_LABELS: Record<string, string> = {
  found: '🦆 Found',
  rehidden: '🫣 Rehidden',
  kept: '🏠 Kept',
  released: '🌊 Released',
};

export const STATUS_LABELS: Record<string, string> = {
  active: '✅ Active',
  missing: '❓ Missing',
  retired: '🏖️ Retired',
  archived: '📦 Archived',
};
