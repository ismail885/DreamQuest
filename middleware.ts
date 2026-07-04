import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';

const protectedRoutes = ['/dashboard', '/create-character', '/create-adventure', '/adventure', '/admin'];
const adminRoutes = ['/admin'];
const authRoutes = ['/auth/login', '/auth/register', '/auth/callback'];
const publicCacheablePaths = ['/classement', '/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = getTokenFromCookies(request.headers.get('cookie'));
  const payload = authToken ? await verifyToken(authToken) : null;
  const isAuthenticated = !!payload;
  const role = payload?.role ?? null;

  const isProtectedRoute = protectedRoutes.some(r => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some(r => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r));

  if (isAdminRoute) {
    if (!isAuthenticated || !role) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'admin') {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('message', 'not_authorized');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const response = NextResponse.next();
  if (isProtectedRoute) {
    response.headers.set('Cache-Control', 'private, no-store');
  } else if (publicCacheablePaths.some(p => pathname.startsWith(p))) {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  }
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profil/:path*',
    '/create-character/:path*',
    '/create-adventure',
    '/adventure/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
