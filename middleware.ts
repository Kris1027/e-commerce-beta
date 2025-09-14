import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { ROLES } from '@/lib/constants/roles';

const { auth } = NextAuth(authConfig);

// Define route patterns for different access levels
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
];

const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/orders',
  '/checkout',
  '/wishlist',
];

const ADMIN_ROUTES = [
  '/admin',
];

export default auth(async function middleware(req) {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  // Check route types
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect authenticated routes
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Protect admin routes - using lightweight ROLES constant for Edge Runtime
  if (isAdminRoute && (!session || session.user?.role !== ROLES.ADMIN)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};