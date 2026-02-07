import { Controller, Post, Body, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('matches')
export class DevController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Handle Like/Pass/Super actions on user profile cards
   * POST /api/v1/matches/action
   */
  @Post('action')
  async recordAction(
    @Body() body: { userId: string; targetUserId: string; action: 'like' | 'pass' | 'super' }
  ) {
    const { userId, targetUserId, action } = body;

    try {
      // Map action to status
      const statusMap = {
        like: 'pending',
        pass: 'passed',
        super: 'pending', // SuperLike is just a special like
      };

      // Record the action in UserLike
      const result = await this.prisma.userLike.create({
        data: {
          senderId: userId,
          receiverId: targetUserId,
          status: statusMap[action],
          highlight: action === 'super' ? 'superlike' : undefined,
        },
      });

      return {
        success: true,
        message: `${action} recorded`,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to record action',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
