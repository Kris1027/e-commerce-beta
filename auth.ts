import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { signInSchema } from '@/lib/validators';
import prisma from '@/db/prisma';
import authConfig from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'credentials',
      name: 'credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = signInSchema.safeParse(credentials);
        
        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              emailVerified: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Auth error:', error);
          }
          return null;
        }
      },
    },
  ],
  events: {
    async signIn({ user }) {
      if (user?.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { updatedAt: new Date() },
        });
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

export { authConfig };