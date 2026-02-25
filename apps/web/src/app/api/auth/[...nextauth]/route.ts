import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
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

const handler = NextAuth(authOptions);

// Next.js may call the exported handler with different shapes (Request-only or (req, ctx)).
// Ensure we always call the internal handler with a `params` object so the NextAuth
// runtime selects the App Router code path and can read the `nextauth` route segments.
async function callHandlerWithParams(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const authIndex = parts.findIndex((p) => p === "auth");
  const nextauth = authIndex >= 0 ? parts.slice(authIndex + 1) : [];
  return handler(req as any, { params: { nextauth } } as any);
}

export const GET = (req: Request) => callHandlerWithParams(req);
export const POST = (req: Request) => callHandlerWithParams(req);
