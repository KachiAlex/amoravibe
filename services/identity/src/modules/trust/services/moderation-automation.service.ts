import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AppConfigService } from '../../../config/config.service';

interface ModerationCasePayload {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: 'AUTOMATION';
  category: string;
  summary: string;
  description?: string;
  reportedUserId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ModerationAutomationService {
  private readonly logger = new Logger(ModerationAutomationService.name);

  constructor(private readonly config: AppConfigService) {}

  async flagLowTrustUser(userId: string, trustScore: number, metrics: Record<string, number>) {
    const severity = trustScore < 20 ? 'CRITICAL' : 'HIGH';
    const payload: ModerationCasePayload = {
      severity,
      source: 'AUTOMATION',
      category: 'TRUST_LOW_SCORE',
      summary: `User ${userId} trust score ${trustScore}`,
      description: `Heuristic trust score fell below threshold. Recent metrics: ${JSON.stringify(
        metrics
      )}`,
      reportedUserId: userId,
      metadata: {
        trustScore,
        metrics,
        triggeredAt: new Date().toISOString(),
      },
    };

    const baseUrl = this.config.moderation.baseUrl.replace(/\/$/, '');

    try {
      await axios.post(`${baseUrl}/cases`, payload, { timeout: 5000 });
      this.logger.log(`Filed moderation case for low-trust user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to file moderation case for ${userId}: ${(error as Error).message}`,
        error as Error
      );
    }
  }
}
