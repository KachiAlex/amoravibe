import { beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { PrismaClientLike } from '../../src/prisma/prisma.types';
import { AuditActorType, AuditEntityType } from '../../src/prisma/client';
import { AppConfigService } from '../../src/config/config.service';

const buildConfig = (): AppConfigService =>
  ({
    audit: {
      exportBucket: 'test-audit-bucket',
      retentionDays: 1,
    },
  }) as AppConfigService;

describe('AuditService', () => {
  let prisma: InMemoryPrismaService;
  let service: AuditService;

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    service = new AuditService(prisma as unknown as PrismaClientLike, buildConfig());
  });

  it('logs device alerts with actor and entity context', async () => {
    await service.logDeviceAlert('user-1', 'alert-message', 'critical', 'fp-1', {
      actor: { type: AuditActorType.service, id: 'device_pipeline' },
      entity: { type: AuditEntityType.device_fingerprint, id: 'fp-1' },
      channel: 'device_pipeline',
    });

    const events = await service.listForUser('user-1');
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      action: 'device_alert_created',
      actorType: AuditActorType.service,
      entityType: AuditEntityType.device_fingerprint,
      channel: 'device_pipeline',
    });
  });

  it('handles export and purge request lifecycles', async () => {
    await service.requestExport('user-2', { scope: 'full' });

    let pendingExports = await service.fetchPendingExportRequests();
    expect(pendingExports).toHaveLength(1);

    await service.markExportProcessing(pendingExports[0].id);
    await service.completeExport(pendingExports[0].id, 's3://bucket/key');

    pendingExports = await service.fetchPendingExportRequests();
    expect(pendingExports).toHaveLength(0);

    const purge = await service.requestPurge('user-2', 'gdpr_user_request');

    let pendingPurges = await service.fetchPendingPurgeRequests();
    expect(pendingPurges).toHaveLength(1);

    await service.markPurgeProcessing(purge.id);
    await service.purgeUserEvents('user-2');
    await service.completePurge(purge.id);

    pendingPurges = await service.fetchPendingPurgeRequests();
    expect(pendingPurges).toHaveLength(0);
  });

  it('deletes expired events beyond configured retention', async () => {
    await service.logDeviceAlert('user-3', 'temporary-alert', 'warning');

    const cutoff = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const result = await service.deleteExpiredEvents(cutoff);

    expect(result.count).toBeGreaterThan(0);
    const events = await service.listForUser('user-3');
    expect(events).toHaveLength(0);
  });
});
