import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hash } from 'bcryptjs';

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

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        hashedPassword,
      },
    });

    // Verify user was created
    if (!user || !user.id) {
      throw new Error('User creation failed: no ID returned');
    }

    // Double-check user exists in DB
    const verifyUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!verifyUser) {
      throw new Error('User verification failed: user not found after creation');
    }

    return NextResponse.json(
      { userId: user.id, email: user.email },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Signup] Error:', {
      message: error?.message,
      code: error?.code,
    });

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
