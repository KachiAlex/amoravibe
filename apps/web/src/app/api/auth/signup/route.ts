import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }
  // Hash password
  const hashedPassword = await hash(password, 10);
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword,
    },
  });
  return NextResponse.json({ userId: user.id });
}
