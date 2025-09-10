import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };
  }

  interface User {
    role: string;
  }
}


// This config is Edge-compatible (no heavy dependencies)
export default {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout', 
    error: '/auth/error',
    newUser: '/dashboard',
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      // The actual authorization logic is in auth.ts
      authorize: async () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        token.name = session.user.name;
      }

      if (user) {
        token['id'] = user.id;
        token['role'] = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token['id'] as string;
        session.user.role = token['role'] as string;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;