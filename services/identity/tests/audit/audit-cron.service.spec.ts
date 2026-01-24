import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditCronService } from '../../src/modules/audit/services/audit-cron.service';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { AppConfigService } from '../../src/config/config.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const sendSpy = vi.fn();

vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi
      .fn()
      .mockImplementation(() => ({ send: (...args: unknown[]) => sendSpy(...args) })),
    PutObjectCommand: vi.fn().mockImplementation((input) => input),
  };
});

const createConfig = (): AppConfigService =>
  ({
    audit: {
      exportBucket: 'audit-test-bucket',
      retentionDays: 30,
    },
  }) as AppConfigService;

const createAuditServiceMock = () => ({
  fetchPendingExportRequests: vi.fn(),
  markExportProcessing: vi.fn(),
  listForUser: vi.fn(),
  completeExport: vi.fn(),
  failExport: vi.fn(),
  fetchPendingPurgeRequests: vi.fn(),
  markPurgeProcessing: vi.fn(),
  purgeUserEvents: vi.fn(),
  completePurge: vi.fn(),
  failPurge: vi.fn(),
  deleteExpiredEvents: vi.fn(),
});

describe('AuditCronService', () => {
  let cron: AuditCronService;
  let auditService: ReturnType<typeof createAuditServiceMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    sendSpy.mockReset();
    auditService = createAuditServiceMock();
    cron = new AuditCronService(auditService as unknown as AuditService, createConfig());
  });

  it('processes export queue and uploads payload to S3', async () => {
    const requestedAt = new Date('2024-01-01T00:00:00Z');
    auditService.fetchPendingExportRequests.mockResolvedValue([
      { id: 'export-1', userId: 'user-123', requestedAt, payload: { filters: ['all'] } },
    ]);
    auditService.listForUser.mockResolvedValue([{ id: 'event-1', action: 'device_alert_created' }]);
    sendSpy.mockResolvedValue({});

    await cron.processExportQueue();

    expect(auditService.markExportProcessing).toHaveBeenCalledWith('export-1');
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(PutObjectCommand as unknown as vi.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'audit-test-bucket',
        Key: expect.stringContaining('audit-exports/user-123/export-1'),
        ContentType: 'application/json',
      })
    );
    expect(auditService.completeExport).toHaveBeenCalledWith(
      'export-1',
      expect.stringContaining('s3://audit-test-bucket/audit-exports/user-123/export-1')
    );
    expect(auditService.failExport).not.toHaveBeenCalled();
  });

  it('marks export as failed when upload throws', async () => {
    auditService.fetchPendingExportRequests.mockResolvedValue([
      { id: 'export-err', userId: 'user-err', requestedAt: new Date(), payload: null },
    ]);
    auditService.listForUser.mockResolvedValue([]);
    sendSpy.mockRejectedValue(new Error('boom'));

    await cron.processExportQueue();

    expect(auditService.markExportProcessing).toHaveBeenCalledWith('export-err');
    expect(auditService.failExport).toHaveBeenCalledWith(
      'export-err',
      expect.stringContaining('boom')
    );
    expect(auditService.completeExport).not.toHaveBeenCalled();
  });

  it('processes purge requests and deletes user events', async () => {
    auditService.fetchPendingPurgeRequests.mockResolvedValue([{ id: 'purge-1', userId: 'user-9' }]);

    await cron.processPurgeQueue();

    expect(auditService.markPurgeProcessing).toHaveBeenCalledWith('purge-1');
    expect(auditService.purgeUserEvents).toHaveBeenCalledWith('user-9');
    expect(auditService.completePurge).toHaveBeenCalledWith('purge-1');
    expect(auditService.failPurge).not.toHaveBeenCalled();
  });

  it('cleans up expired events daily', async () => {
    auditService.deleteExpiredEvents.mockResolvedValue({ count: 7 });

    await cron.cleanupExpiredEvents();

    expect(auditService.deleteExpiredEvents).toHaveBeenCalledTimes(1);
    const [cutoff] = auditService.deleteExpiredEvents.mock.calls[0];
    expect(cutoff).toBeInstanceOf(Date);
  });
});
