import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AuditService } from './audit.service';
import { AppConfigService } from '../../../config/config.service';

@Injectable()
export class AuditCronService {
  private readonly logger = new Logger(AuditCronService.name);
  private readonly s3: S3Client;

  constructor(
    private readonly auditService: AuditService,
    private readonly config: AppConfigService
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              sessionToken: process.env.AWS_SESSION_TOKEN,
            }
          : undefined,
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async processExportQueue() {
    // Disabled in SQLite dev mode
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processPurgeQueue() {
    // Disabled in SQLite dev mode
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredEvents() {
    // Disabled in SQLite dev mode
  }
}
