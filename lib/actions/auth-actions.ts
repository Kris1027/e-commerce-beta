'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { signInSchema, signUpSchema } from '@/lib/validators';
import prisma from '@/db/prisma';
import bcrypt from 'bcryptjs';

export type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function signInAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawFormData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedFields = signInSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0]?.message || 'Invalid fields',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    console.error('Sign in error:', error);
    return { error: 'Failed to sign in' };
  }
}

export async function signUpAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const validatedFields = signUpSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0]?.message || 'Invalid fields',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'customer',
      },
    });

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Failed to sign in after registration' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    console.error('Signup error:', error);
    return { error: 'Failed to create account' };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}