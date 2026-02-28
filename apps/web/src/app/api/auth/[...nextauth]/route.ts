import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Build `authOptions` per-request and import Prisma adapter + client lazily.
export async function buildAuthOptions(req?: Request): Promise<NextAuthOptions> {
  const { PrismaAdapter } = await import("@next-auth/prisma-adapter");
  const prisma = (await import("@/lib/db")).default;

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

          // Debug logging
          console.log('[NextAuth] authorize called:', { email, phone, username });

          // Dev/admin shortcut
          if (email === 'admin@amoravibe.com' && password === 'admin123') {
            console.log('[NextAuth] Admin shortcut login');
            return { id: 'admin@amoravibe.com', displayName: 'Admin' } as any;
          }

          // Guest quick-login
          if (username === 'guest') {
            console.log('[NextAuth] Guest shortcut login');
            return { id: 'local-guest', displayName: 'Guest' } as any;
          }

          // Email/password
          if (email && password) {
            const user = await prisma.user.findUnique({ where: { email } });
            console.log('[NextAuth] User lookup:', user);
            if (!user || !user.hashedPassword) {
              console.log('[NextAuth] User not found or missing hashedPassword');
              return null;
            }
            const isValid = await compare(password, user.hashedPassword);
            console.log('[NextAuth] Password comparison:', { input: password, hash: user.hashedPassword, isValid });
            if (!isValid) {
              console.log('[NextAuth] Password invalid');
              return null;
            }
            return user as any;
          }

          // Phone/password flow (legacy mobile numbers stored on user.phone)
          if (phone && password) {
            const user = await prisma.user.findFirst({ where: { phone } });
            console.log('[NextAuth] Phone user lookup:', user);
            if (!user || !user.hashedPassword) {
              console.log('[NextAuth] Phone user not found or missing hashedPassword');
              return null;
            }
            const isValid = await compare(password, user.hashedPassword);
            console.log('[NextAuth] Phone password comparison:', { input: password, hash: user.hashedPassword, isValid });
            if (!isValid) {
              console.log('[NextAuth] Phone password invalid');
              return null;
            }
            return user as any;
          }

          console.log('[NextAuth] No valid credentials provided');
          return null;
        },
      }),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/?openSignIn=1' },
    callbacks: {
      async session({ session, token }: any) {
        if (token?.sub) (session as any).userId = token.sub;
        return session;
      },
    },
  };
}

type NextAuthContext = { params?: { nextauth?: string[] } | Promise<{ nextauth?: string[] }> };

async function resolveNextauthSegments(req: Request, ctx?: NextAuthContext) {
  const parsed = new URL(req.url).pathname.split('/').filter(Boolean);
  const authIndex = parsed.findIndex((p) => p === 'auth');
  const nextauthFromUrl = authIndex >= 0 ? parsed.slice(authIndex + 1) : [];

  const ctxParams = ctx?.params;
  const resolvedParams = ctxParams && typeof (ctxParams as any).then === 'function' ? await ctxParams : ctxParams;
  const paramsSegments = resolvedParams?.nextauth;
  const nextauth = paramsSegments && paramsSegments.length > 0 ? paramsSegments : nextauthFromUrl;
  const action = Array.isArray(nextauth) && nextauth.length > 0 ? nextauth[0] : undefined;
  return { nextauth, action };
}

// Build and call NextAuth per-request so PrismaClient isn't created at module import time.
async function handlerWithParams(req: Request, ctx?: NextAuthContext) {
  const options = await buildAuthOptions(req);
  const handler = NextAuth(options as any);
  return handler(req as any, ctx as any);
}

export async function GET(req: Request, ctx?: NextAuthContext) {
  const { action } = await resolveNextauthSegments(req, ctx);
  const allowed = new Set(['csrf', 'signin', 'signout', 'callback', 'session', 'providers', 'verify-request', 'error']);
  if (!action || !allowed.has(action)) {
    // Avoid initializing NextAuth/Prisma during build-time collection or unexpected calls.
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Forward to the real handler for known auth actions.
  return handlerWithParams(req, ctx);
}

export async function POST(req: Request, ctx?: NextAuthContext) {
  const { action } = await resolveNextauthSegments(req, ctx);
  const allowed = new Set(['csrf', 'signin', 'signout', 'callback', 'session', 'providers', 'verify-request', 'error']);
  if (!action || !allowed.has(action)) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return handlerWithParams(req, ctx);
}
