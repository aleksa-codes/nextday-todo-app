import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Define route patterns
const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/signin', '/signup', '/reset-password', '/goodbye'];

const isPublicRoute = (pathname: string) => PUBLIC_ROUTES.includes(pathname);
const isAuthRoute = (pathname: string) => AUTH_ROUTES.includes(pathname);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = getSessionCookie(request);

  // If user is logged in, they shouldn't access auth routes
  if (sessionCookie && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/todos', request.url));
  }

  // If user is not logged in and trying to access protected routes
  if (!sessionCookie && !isAuthRoute(pathname) && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
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
    '/((?!api/auth|api/webhook/polar|_next/static|_next/image|favicon.ico).*)',
  ],
};
