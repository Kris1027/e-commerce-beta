// Authentication related constants

// Default redirect path after authentication
export const DEFAULT_AUTH_REDIRECT = '/dashboard';

// Authentication routes
export const AUTH_ROUTES = {
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
} as const;

// Protected route patterns (also defined in middleware.ts)
export const PROTECTED_ROUTES = [
  '/checkout',
  '/orders',
  '/dashboard',
  '/profile',
  '/wishlist',
  '/admin',
] as const;