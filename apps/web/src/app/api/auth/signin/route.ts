import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { compare } from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user by email
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If user does not exist (dev mode), create a temporary account using provided password
    if (!user) {
      // Only allow auto-creation in development environment
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      const hashed = await import('bcryptjs').then(m => m.hash(password, 10));
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          hashedPassword: hashed,
          role: 'user',
        },
      });
    }


    // Verify password
    const isValid = await compare(password, user.hashedPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
    });

    // Set token in httpOnly cookie
    const response = NextResponse.json(
      { userId: user.id, email: user.email, role: user.role },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    response.cookies.set('lovedate_session', JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[SignIn] Error:', error?.message);
    return NextResponse.json(
      { error: error?.message || 'Sign in failed' },
      { status: 500 }
    );
  }
}
