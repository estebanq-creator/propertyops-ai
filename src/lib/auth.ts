import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { UserRole } from '@/types';
import { landlords } from '@/lib/landlord-seed';

// Extended user type with RBAC fields
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  propertyIds: string[];
  landlordId?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'propertyops',
      name: 'PropertyOpsAI',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          const email = credentials.email as string;

          // Route to landlord session if email matches a seed account
          const landlord = landlords.find(
            (l) => l.email.toLowerCase() === email.toLowerCase()
          );

          if (landlord) {
            const user: ExtendedUser = {
              id: landlord.id,
              email: landlord.email,
              name: landlord.name,
              role: 'landlord',
              propertyIds: landlord.propertyIds,
              landlordId: landlord.id,
            };
            return user;
          }

          // Fallback: owner (David and any non-landlord email)
          const user: ExtendedUser = {
            id: '1',
            email,
            name: email,
            role: 'owner',
            propertyIds: [],
            landlordId: undefined,
          };
          return user;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.AUTH_SESSION_MAX_AGE || '86400', 10), // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.propertyIds = user.propertyIds;
        token.landlordId = user.landlordId;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as UserRole;
        session.user.propertyIds = token.propertyIds as string[] || [];
        session.user.landlordId = token.landlordId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
});
