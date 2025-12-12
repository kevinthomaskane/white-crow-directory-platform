import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_DOMAIN } from './lib/constants';

export function proxy(request: NextRequest) {
  const site = process.env.SITE || request.headers.get('host') || '';

  if (site === ADMIN_DOMAIN) {
    // Only rewrite root to /admin, let /admin/* paths pass through
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set('x-site', site);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
