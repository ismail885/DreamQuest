import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Server-side protected routes
const protectedRoutes = ['/dashboard', '/profil', '/create-character', '/adventure', '/admin'];
// Admin routes are protected separately with role checks
const adminRoutes = ['/admin'];
// Public auth routes
const authRoutes = ['/auth/login', '/auth/register', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth check from cookie (set by AuthContext after login)
  const authUser = request.cookies.get('auth_user')?.value;
  const isAuthenticated = !!authUser;
  
  // Extract role from cookie
  const role = request.cookies.get('auth_role')?.value || null;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Admin routes protection (server-side): requires JWT with admin role
  if (isAdminRoute) {
    // Step 1: ensure the user is authenticated via JWT
    if (!isAuthenticated || !role) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Step 2: verify admin role from JWT payload
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
    '/adventure/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
