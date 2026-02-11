import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(skip = 0, take = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } },
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
    const [totalUsers, signupsThisWeek] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);
    return { totalUsers, signupsThisWeek };
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
    // Remove banned field, as it does not exist in schema
    throw new Error('User banning is not supported: banned field does not exist in schema');
  }

  async getHealth() {
    // Simple DB check
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
