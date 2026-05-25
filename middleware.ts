import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';

const protectedRoutes = ['/dashboard', '/profil', '/create-character', '/create-adventure', '/adventure', '/admin'];
const adminRoutes = ['/admin'];
const authRoutes = ['/auth/login', '/auth/register', '/auth/callback'];

// Pages statiques à cache (très dynamiques = court, statiques = long)
const cachedStaticPaths = ['/adventure', '/classement', '/auth/login', '/auth/register'];
const cachedShortPaths = ['/create-adventure', '/dashboard', '/create-character'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ajouter headers cache pour pages publiques statiques (longue durée)
  if (cachedStaticPaths.includes(pathname) || cachedStaticPaths.some(path => pathname.startsWith(path))) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return response;
  }

  // Pages avec cache court (dynamic mais pas personnalisé)
  if (cachedShortPaths.includes(pathname)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    return response;
  }

  // ============================================
  // VÉRIFICATION JWT — via lib/jwt
  // ============================================
  const authToken = getTokenFromCookies(request.headers.get('cookie'));
  const payload = authToken ? await verifyToken(authToken) : null;
  
  const isAuthenticated = !!payload;
  const role = payload?.role ?? null;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

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

  return NextResponse.next();
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

