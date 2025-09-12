import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import authConfig from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
  const { nextUrl } = req;
  const session = req.auth;
  
  // List of protected routes that require authentication
  const protectedRoutes = [
    '/checkout',
    '/checkout/shipping',
    '/checkout/payment',
    '/checkout/review',
    '/orders',
    '/dashboard',
    '/profile',
  ];
  
  // Admin only routes
  const adminRoutes = [
    '/admin',
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );
  
  // Redirect to sign in if accessing protected route without authentication
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Redirect to home if accessing admin route without admin role
  if (isAdminRoute && (!session || session.user?.role !== 'admin')) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};