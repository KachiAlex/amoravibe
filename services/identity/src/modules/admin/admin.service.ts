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
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const [totalUsers, activeUsers, bannedUsers, signupsThisWeek] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastActiveAt: { not: null } } }),
      this.prisma.user.count({ where: { banned: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);
    return { totalUsers, activeUsers, bannedUsers, signupsThisWeek };
  }

  async getActivityLog() {
    // Return the 50 most recent audit events with user info
    const events = await this.prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, email: true, displayName: true }
        }
      }
    });
    return events;
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
