'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function signInWithCredentials(
  email: string,
  password: string
) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          throw new Error('Invalid email or password');
        default:
          throw new Error('Something went wrong');
      }
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}