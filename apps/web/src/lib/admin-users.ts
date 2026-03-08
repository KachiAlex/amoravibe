import prisma from '@/lib/db';

export type AdminUserStatus = 'all' | 'active' | 'banned';

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: AdminUserStatus;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export async function queryAdminUsers(params: AdminUserQuery = {}) {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(params.limit ?? DEFAULT_LIMIT)));
  const skip = (page - 1) * limit;
  const search = params.search?.trim();
  const role = params.role?.trim();
  const status = params.status ?? 'all';

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { displayName: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status === 'active') {
    where.banned = false;
  } else if (status === 'banned') {
    where.banned = true;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        banned: true,
        createdAt: true,
        onboardingCompleted: true,
        location: true,
      },
    }),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
