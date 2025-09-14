/**
 * User role constants for use in Edge Runtime environments
 * where Prisma enums are not available
 */

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];