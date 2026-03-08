import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export interface AdminUserContext {
  id: string;
  email: string;
  role: string;
}

export async function getAdminUser(): Promise<AdminUserContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  const userId = typeof payload?.userId === 'string' ? payload.userId : null;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  return user;
}

export async function requireAdminUser(): Promise<AdminUserContext> {
  const user = await getAdminUser();
  if (!user) {
    redirect('/login?next=/admin');
  }
  return user;
}
