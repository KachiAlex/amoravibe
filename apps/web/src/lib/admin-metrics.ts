import prisma from '@/lib/db';

export interface AdminMetricSnapshot {
  totalMembers: number;
  activeDay: number;
  newSignups: number;
  flaggedAccounts: number;
}

export async function getAdminMetrics(): Promise<AdminMetricSnapshot> {
  const dayWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalMembers, newSignups, activeDay, flaggedAccounts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: dayWindow } } }),
    prisma.match.count({ where: { updatedAt: { gte: dayWindow } } }),
    prisma.user.count({ where: { banned: true } }),
  ]);

  return {
    totalMembers,
    activeDay,
    newSignups,
    flaggedAccounts,
  };
}
