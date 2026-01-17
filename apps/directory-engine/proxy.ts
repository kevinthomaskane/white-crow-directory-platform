import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { ADMIN_DOMAIN } from './lib/constants';

export async function proxy(request: NextRequest) {
  const site = process.env.SITE || request.headers.get('host') || '';
  console.log('Incoming request for site:', site);

  let response = NextResponse.next({ request });

  // Create Supabase client for session handling on all routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  // Non-admin sites
  if (site !== ADMIN_DOMAIN) {
    // Block access to /admin routes on non-admin sites
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/__not-found';
      return NextResponse.rewrite(url);
    }
    response.headers.set('x-site', site);
    return response;
  }

  // Admin site: rewrite root to /admin
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    const rewriteResponse = NextResponse.rewrite(url);
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie);
    });
    return rewriteResponse;
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
