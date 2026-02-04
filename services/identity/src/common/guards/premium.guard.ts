import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  private readonly logger = new Logger(PremiumGuard.name);

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.query?.userId;

    if (!userId) {
      throw new HttpException({ error: 'User ID required' }, HttpStatus.UNAUTHORIZED);
    }

    try {
      // Check if user has active premium subscription
      // This is a simplified check - you'd want to integrate with Stripe
      // For now, check if user has premium flag in DB
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }, // TODO: Add premium_until field to User model
      });

      if (!user) {
        throw new HttpException({ error: 'User not found' }, HttpStatus.NOT_FOUND);
      }

      // TODO: Check subscription status from Stripe or local DB
      // const hasPremium = await this.checkPremiumStatus(userId);
      // if (!hasPremium) {
      //   throw new HttpException(
      //     { error: 'Premium subscription required' },
      //     HttpStatus.PAYMENT_REQUIRED,
      //   );
      // }

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error checking premium status for ${userId}:`, error);
      throw new HttpException(
        { error: 'Authorization check failed' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check if user has active premium subscription
   * Integrate with your subscription provider (Stripe, etc)
   */
  private async checkPremiumStatus(_userId: string): Promise<boolean> {
    // TODO: Implement
    // Option 1: Query Stripe API for active subscription
    // Option 2: Store subscription end date in DB and check expiry
    // For MVP, return false to gate premium features
    return false;
  }
}
