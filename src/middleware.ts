import { betterFetch } from '@better-fetch/fetch';
import type { Session } from 'better-auth/types';
import { NextResponse, type NextRequest } from 'next/server';

// Define route patterns
const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/signin', '/signup', '/reset-password'];

const isPublicRoute = (pathname: string) => PUBLIC_ROUTES.includes(pathname);
const isAuthRoute = (pathname: string) => AUTH_ROUTES.includes(pathname);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    // If user is logged in, they shouldn't access auth routes
    if (session && isAuthRoute(pathname)) {
      return NextResponse.redirect(new URL('/todo', request.url));
    }

    // If user is not logged in and trying to access protected routes
    if (!session && !isAuthRoute(pathname) && !isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
  } catch {
    // If there's an error checking the session
    if (!isAuthRoute(pathname) && !isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }
}

// Protect all routes except excluded ones
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
