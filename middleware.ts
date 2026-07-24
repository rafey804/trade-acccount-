// =============================================================================
// Trader Command Center — Auth Middleware
// =============================================================================
// Protects ALL routes except /login, /api/auth/*, and static assets.
// Unauthenticated users are redirected to /login.
// =============================================================================

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow these paths without authentication
  const publicPaths = [
    '/login',
    '/api/auth',
    '/favicon.ico',
    '/logo.svg',
  ];

  const isPublic = publicPaths.some(path => pathname.startsWith(path));
  const isStaticAsset = pathname.startsWith('/_next/');

  if (isPublic || isStaticAsset) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
