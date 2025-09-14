import { auth } from '@/auth';
import { UserRole } from '@prisma/client';

export async function getSessionUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== UserRole.admin) {
    throw new Error('Forbidden');
  }
  return user;
}