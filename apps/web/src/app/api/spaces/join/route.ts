import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { buildAuthOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(await buildAuthOptions());
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { orientation } = body;

    if (!orientation || !['straight', 'lgbtq'].includes(orientation)) {
      return NextResponse.json({ error: 'Invalid orientation' }, { status: 400 });
    }

    // Find the space by orientation
    const space = await prisma.space.findFirst({
      where: { orientation },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.spaceMember.findUnique({
      where: {
        uniq_space_member: {
          userId: user.id,
          spaceId: space.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ message: 'Already a member of this space', space }, { status: 200 });
    }

    // Add user to space
    const spaceMember = await prisma.spaceMember.create({
      data: {
        userId: user.id,
        spaceId: space.id,
      },
    });

    return NextResponse.json({ message: 'Successfully joined space', space, spaceMember }, { status: 201 });
  } catch (err) {
    console.error('[Spaces/Join] Error:', err);
    return NextResponse.json({ error: 'Failed to join space' }, { status: 500 });
  }
}
