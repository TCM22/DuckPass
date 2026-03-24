import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env';
import { safeAppPath } from '@/lib/nav';

/**
 * PKCE / email-confirm redirects must attach session cookies to this response.
 * Using `cookies()` from `next/headers` alone often does not attach Set-Cookie to redirects.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const oauthError = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  if (oauthError) {
    console.error('[auth/callback] Supabase redirect error', oauthError, errorDescription);
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'auth');
    if (errorDescription) {
      loginUrl.searchParams.set('auth_msg', errorDescription);
    }
    return NextResponse.redirect(loginUrl);
  }

  const code = requestUrl.searchParams.get('code');
  const next = safeAppPath(requestUrl.searchParams.get('next'), '/dashboard');

  if (code) {
    const redirectUrl = new URL(next, requestUrl.origin);
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    console.log('[auth/callback] exchanging code for session');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('[auth/callback] session established, redirecting to', next);
      return response;
    }
    console.error('[auth/callback] exchangeCodeForSession failed', error.message, error);
  } else {
    console.warn('[auth/callback] missing code param');
  }

  return NextResponse.redirect(new URL('/login?error=auth', request.url));
}
