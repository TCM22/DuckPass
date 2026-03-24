'use server';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Records a page view / scan for analytics. Uses a salted hash of IP — not reversible.
 * Call once per page load from the public duck page (client debounces via sessionStorage).
 */
export async function recordScanEvent(duckId: string): Promise<{ ok?: true; error?: string }> {
  if (!duckId) {
    return { error: 'Missing duck' };
  }

  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  const rawIp = forwarded?.split(',')[0]?.trim() || '';
  const salt = process.env.SCAN_IP_SALT || 'duckpass-scan-salt';
  const ipHash =
    rawIp.length > 0
      ? createHash('sha256')
          .update(`${rawIp}:${salt}`)
          .digest('hex')
          .slice(0, 32)
      : null;

  const userAgent = h.get('user-agent')?.slice(0, 512) || null;
  const referer = h.get('referer')?.slice(0, 512) || null;

  const supabase = await createClient();
  const base = {
    duck_id: duckId,
    ip_address: null as string | null,
    user_agent: userAgent,
    referer: referer,
    ip_hash: ipHash,
  };

  let { error } = await supabase.from('scan_events').insert(base);
  if (error && /ip_hash|schema|column/i.test(error.message)) {
    const { error: e2 } = await supabase.from('scan_events').insert({
      duck_id: duckId,
      ip_address: null,
      user_agent: userAgent,
      referer: referer,
    });
    error = e2;
  }

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}
