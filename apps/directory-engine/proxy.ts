import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { ADMIN_DOMAIN } from './lib/constants';

export async function proxy(request: NextRequest) {
  const site = process.env.SITE || request.headers.get('host') || '';

  // Non-admin routes: just set x-site header, no session handling needed
  if (site !== ADMIN_DOMAIN) {
    const response = NextResponse.next();
    response.headers.set('x-site', site);
    return response;
  }

  // Admin routes: handle Supabase session
  let response = NextResponse.next({ request });

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

  await supabase.auth.getUser();

  // Rewrite root to /admin
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
