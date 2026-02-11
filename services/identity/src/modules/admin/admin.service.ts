import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(skip = 0, take = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { displayName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, where, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total };
  }

  async getMetrics() {
    const [totalUsers, activeUsers, bannedUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastActiveAt: { not: null } } }),
      this.prisma.user.count({ where: { banned: true } }),
    ]);
    // TODO: Add signupsThisWeek logic
    return { totalUsers, activeUsers, bannedUsers, signupsThisWeek: 0 };
  }

  async getActivityLog() {
    // TODO: Implement real activity log (requires audit table)
    return [];
  }

  async verifyUser(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isVerified: true } });
  }

  async banUser(id: string, ban: boolean) {
    return this.prisma.user.update({ where: { id }, data: { banned: ban } });
  }

  async getHealth() {
    // Simple DB check
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
