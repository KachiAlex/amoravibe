import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Build `authOptions` per-request and import Prisma adapter + client lazily.
export async function buildAuthOptions(): Promise<NextAuthOptions> {
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
          const password = credentials?.password?.toString() || undefined;

          // Debug logging
          console.log('[NextAuth] authorize called:', { email });

          // Dev/admin shortcut
          if (email === 'admin@amoravibe.com' && password === 'admin123') {
            console.log('[NextAuth] Admin shortcut login');
            return { id: 'admin@amoravibe.com', displayName: 'Admin' } as any;
          }

          // Email/password
          if (email && password) {
            const user = await prisma.user.findUnique({ where: { email } });
            console.log('[NextAuth] User lookup:', user);
            if (!user || !user.hashedPassword) {
              console.log('[NextAuth] User not found or missing hashedPassword');
              throw new Error('AccountNotFound');
            }
            const isValid = await compare(password, user.hashedPassword);
            console.log('[NextAuth] Password comparison:', { isValid });
            if (!isValid) {
              console.log('[NextAuth] Password invalid');
              throw new Error('InvalidPassword');
            }
            return user as any;
          }

          console.log('[NextAuth] No valid credentials provided');
          throw new Error('MissingCredentials');
        },
      }),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/?openSignIn=1', error: '/auth/error' },
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.sub = user.id;
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }: any) {
        if (token?.sub) {
          (session as any).userId = token.sub;
          (session as any).user = (session as any).user || {};
          (session as any).user.id = token.sub;
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        try {
          const parsed = new URL(url, baseUrl);
          if (parsed.origin === baseUrl) {
            return parsed.toString();
          }
        } catch (err) {
          // ignore parse errors and fallback below
        }
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        return `${baseUrl}/dashboard`;
      },
    },
  };
}

type NextAuthRouteParams = { nextauth?: string[] };
type NextAuthContext = { params?: NextAuthRouteParams | Promise<NextAuthRouteParams> };

async function resolveNextauthSegments(req: Request, ctx?: NextAuthContext) {
  const parsed = new URL(req.url).pathname.split('/').filter(Boolean);
  const authIndex = parsed.findIndex((p) => p === 'auth');
  const nextauthFromUrl = authIndex >= 0 ? parsed.slice(authIndex + 1) : [];

  const ctxParams = ctx?.params;
  let resolvedParams: NextAuthRouteParams | undefined;
  if (ctxParams) {
    resolvedParams = typeof (ctxParams as any).then === 'function' ? await ctxParams : (ctxParams as NextAuthRouteParams);
  }
  const paramsSegments = resolvedParams?.nextauth;
  const nextauth = paramsSegments && paramsSegments.length > 0 ? paramsSegments : nextauthFromUrl;
  const action = Array.isArray(nextauth) && nextauth.length > 0 ? nextauth[0] : undefined;
  return { nextauth, action };
}

// Build and call NextAuth per-request so PrismaClient isn't created at module import time.
async function handlerWithParams(req: Request, ctx?: NextAuthContext) {
  try {
    const url = req.url;
    console.log('[NextAuth] handlerWithParams invoked', url);
  } catch (err) {
    console.warn('[NextAuth] handlerWithParams logging failed', err);
  }
  const options = await buildAuthOptions();
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
