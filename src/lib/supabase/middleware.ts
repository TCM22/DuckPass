import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isProtected =
    path.startsWith('/dashboard') ||
    path.startsWith('/admin') ||
    path.startsWith('/account-suspended');

  // Redirect unauthenticated users away from protected routes.
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  const needsProfileChecks =
    user &&
    (path.startsWith('/dashboard') ||
      path.startsWith('/admin') ||
      path.startsWith('/account-suspended'));

  if (needsProfileChecks) {
    // Use select('*') so missing optional columns (e.g. suspended before migration 004) do not
    // fail the whole request — PostgREST returns only columns that exist on the table.
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile && typeof profile === 'object' && 'role' in profile ? String((profile as { role: string }).role) : undefined;
    const suspended =
      Boolean(profile && typeof profile === 'object' && 'suspended' in profile && (profile as { suspended?: boolean }).suspended);

    if (suspended && !path.startsWith('/account-suspended')) {
      const url = request.nextUrl.clone();
      url.pathname = '/account-suspended';
      const redirectResponse = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    if (!suspended && path.startsWith('/account-suspended')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      const redirectResponse = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    if (path.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      const redirectResponse = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
