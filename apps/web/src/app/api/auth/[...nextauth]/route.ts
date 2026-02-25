import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

async function buildAuthOptions() : Promise<NextAuthOptions> {
  // Lazy-import prisma and the adapter to avoid initializing Prisma at module load time
  const prisma = (await import('@/lib/db')).default;
  const { PrismaAdapter } = await import('@next-auth/prisma-adapter');

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", required: false },
          phone: { label: "Phone", type: "tel", required: false },
          username: { label: "Username", type: "text", required: false },
          password: { label: "Password", type: "password", required: false },
        },
        async authorize(credentials) {
          const email = credentials?.email?.toString() || undefined;
          const phone = credentials?.phone?.toString() || undefined;
          const username = credentials?.username?.toString() || undefined;
          const password = credentials?.password?.toString() || undefined;

          // Dev/admin shortcut
          if (email === 'admin@amoravibe.com' && password === 'admin123') {
            return { id: 'admin@amoravibe.com', displayName: 'Admin' } as any;
          }

          // Guest quick-login
          if (username === 'guest') {
            return { id: 'local-guest', displayName: 'Guest' } as any;
          }

          // Email/password
          if (email && password) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !user.hashedPassword) return null;
            const isValid = await compare(password, user.hashedPassword);
            if (!isValid) return null;
            return user as any;
          }

          // Phone/password flow (legacy mobile numbers stored on user.phone)
          if (phone && password) {
            const user = await prisma.user.findFirst({ where: { phone } });
            if (!user || !user.hashedPassword) return null;
            const isValid = await compare(password, user.hashedPassword);
            if (!isValid) return null;
            return user as any;
          }

          return null;
        },
      }),
    ],
    session: { strategy: 'jwt' },
    pages: {
      signIn: '/?openSignIn=1',
    },
    callbacks: {
      async session({ session, token }: any) {
        if (token?.sub) (session as any).userId = token.sub;
        return session;
      },
    },
  };
}

export async function GET(request: Request) {
  const options = await buildAuthOptions();
  const handler = NextAuth(options);
  // @ts-ignore - NextAuth handler is compatible with App Router request/response
  return handler(request as any);
}

export async function POST(request: Request) {
  const options = await buildAuthOptions();
  const handler = NextAuth(options);
  // @ts-ignore
  return handler(request as any);
}
