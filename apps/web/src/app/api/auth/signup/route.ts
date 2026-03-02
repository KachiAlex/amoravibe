
console.log('[Signup] API route loaded');
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import fs from 'fs';

export const dynamic = 'force-dynamic';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    console.log('[Signup] Request received:', { method: req.method, url: req.url });
    try {
      const hdrs = Object.fromEntries(req.headers?.entries ? req.headers.entries() : [] as any);
      console.log('[Signup] request headers:', hdrs);
    } catch (hErr) {
      console.warn('[Signup] could not read headers', hErr);
    }
    const raw = await req.text();
    console.log('[Signup] raw body:', raw);
    try {
      const reqLog = {
        time: new Date().toISOString(),
        method: req.method,
        url: req.url,
        rawBodySnippet: raw && raw.length > 200 ? raw.slice(0, 200) + '...' : raw
      };
      fs.appendFileSync('tmp/signup_requests.log', JSON.stringify(reqLog) + '\n');
    } catch (werr) {
      console.error('[Signup] Failed to write signup_requests.log', werr);
    }
    let payload: any;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch (parseErr) {
      console.error('[Signup] JSON parse error:', parseErr);
      return NextResponse.json({ error: 'Invalid JSON body', details: String(parseErr) }, { status: 400 });
    }

    const { email, password } = payload || {};
    console.log('[Signup] Received:', { email });
    if (!email || !password) {
      console.log('[Signup] Missing email or password');
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('[Signup] Email already registered:', email);
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    try {
      console.log('[Signup] Creating user with:', { email, hashedPasswordLength: hashedPassword.length });
      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword,
        },
      });
      console.log('[Signup] User created successfully:', { id: user.id, email: user.email, createdAt: user.createdAt });
      return NextResponse.json({ userId: user.id });
    } catch (dbErr) {
      console.error('[Signup] Prisma create error:', dbErr && (dbErr as any).message ? (dbErr as any).message : String(dbErr));
      console.error('[Signup] Prisma error code:', (dbErr as any)?.code);
      console.error('[Signup] Prisma error stack:', dbErr && (dbErr as any).stack ? (dbErr as any).stack : '<no-stack>');
      try {
        const logEntry = {
          time: new Date().toISOString(),
          message: dbErr && (dbErr as any).message ? (dbErr as any).message : String(dbErr),
          code: (dbErr as any)?.code,
          stack: dbErr && (dbErr as any).stack ? (dbErr as any).stack : '<no-stack>'
        };
        fs.appendFileSync('tmp/signup_error.log', JSON.stringify(logEntry) + '\n');
      } catch (fileErr) {
        console.error('[Signup] Failed to write signup_error.log', fileErr);
      }
      return NextResponse.json({ error: 'Database error', details: String(dbErr) }, { status: 500 });
    }
  } catch (err) {
    console.error('[Signup] Unexpected error:', err && (err as any).message ? (err as any).message : String(err));
    console.error('[Signup] Unexpected stack:', err && (err as any).stack ? (err as any).stack : '<no-stack>');
    try {
      const logEntry = {
        time: new Date().toISOString(),
        message: err && (err as any).message ? (err as any).message : String(err),
        stack: err && (err as any).stack ? (err as any).stack : '<no-stack>'
      };
      fs.appendFileSync('tmp/signup_error.log', JSON.stringify(logEntry) + '\n');
    } catch (fileErr) {
      console.error('[Signup] Failed to write signup_error.log', fileErr);
    }
    return NextResponse.json({ error: 'Unexpected server error', details: String(err) }, { status: 500 });
  }
}
