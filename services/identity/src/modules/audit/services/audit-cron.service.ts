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
    const requests = await this.auditService.fetchPendingExportRequests();
    if (requests.length === 0) {
      return;
    }

    this.logger.log(`Processing ${requests.length} pending audit export requests`);
    const bucket = this.config.audit.exportBucket;

    for (const request of requests) {
      await this.auditService.markExportProcessing(request.id);

      try {
        const events = await this.auditService.listForUser(request.userId);
        const payload = JSON.stringify({
          userId: request.userId,
          requestedAt: request.requestedAt,
          generatedAt: new Date().toISOString(),
          events,
          extra: request.payload,
        });

        const key = `audit-exports/${request.userId}/${request.id}.json`;
        await this.s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: payload,
            ContentType: 'application/json',
          })
        );

        const location = `s3://${bucket}/${key}`;
        await this.auditService.completeExport(request.id, location);
      } catch (error) {
        const reason = (error as Error)?.message ?? 'Failed to process export';
        this.logger.error(`Failed to process audit export ${request.id}: ${reason}`);
        await this.auditService.failExport(request.id, reason);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processPurgeQueue() {
    const requests = await this.auditService.fetchPendingPurgeRequests();
    if (requests.length === 0) {
      return;
    }

    this.logger.log(`Processing ${requests.length} pending audit purge requests`);

    for (const request of requests) {
      await this.auditService.markPurgeProcessing(request.id);

      try {
        await this.auditService.purgeUserEvents(request.userId);
        await this.auditService.completePurge(request.id);
      } catch (error) {
        const reason = (error as Error)?.message ?? 'Failed to process purge';
        this.logger.error(`Failed to process audit purge ${request.id}: ${reason}`);
        await this.auditService.failPurge(request.id, reason);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredEvents() {
    const cutoff = new Date();
    const result = await this.auditService.deleteExpiredEvents(cutoff);
    if (result.count && result.count > 0) {
      this.logger.log(`Deleted ${result.count} expired audit events`);
    }
  }
}
