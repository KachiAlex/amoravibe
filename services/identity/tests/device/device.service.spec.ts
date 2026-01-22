import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import { DeviceService } from '../../src/modules/device/services/device.service';
import { IngestDeviceFingerprintDto } from '../../src/modules/device/dto/ingest-device-fingerprint.dto';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { ModerationSeverity } from '../../src/common/enums/moderation-severity.enum';
import { FakeAuditService } from '../utils/fake-audit.service';

const samplePayload = (
  overrides: Partial<IngestDeviceFingerprintDto> = {}
): IngestDeviceFingerprintDto => ({
  hash: overrides.hash ?? randomUUID(),
  userAgent: overrides.userAgent ?? 'vitest-agent',
  userId: overrides.userId,
  signals: overrides.signals,
});

describe('DeviceService', () => {
  let prisma: InMemoryPrismaService;
  let deviceService: DeviceService;
  let auditService: FakeAuditService;

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    auditService = new FakeAuditService();
    deviceService = new DeviceService(prisma as never, auditService as never);
  });

  it('flags high device turnover for a user', async () => {
    const userId = randomUUID();

    // Seed three historical devices to hit the turnover threshold
    await deviceService.ingest(samplePayload({ userId }));
    await deviceService.ingest(samplePayload({ userId }));
    await deviceService.ingest(samplePayload({ userId }));

    const result = await deviceService.ingest(samplePayload({ userId }));

    expect(result.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'User has high device turnover. Review for account sharing.',
          severity: ModerationSeverity.WARNING,
        }),
      ])
    );
    expect(result.fingerprint.riskLabel).toBe('medium');

    const moderationEvents = await prisma.moderationEvent.findMany({ where: { userId } });
    expect(moderationEvents).toHaveLength(1);
    expect(moderationEvents[0]).toMatchObject({
      userId,
      severity: ModerationSeverity.WARNING,
      message: 'User has high device turnover. Review for account sharing.',
    });

    expect(auditService.deviceLogs).toEqual([
      {
        userId,
        message: 'User has high device turnover. Review for account sharing.',
        severity: ModerationSeverity.WARNING,
        deviceFingerprintId: expect.any(String),
      },
    ]);
  });

  it('flags fingerprints reused across multiple users as spoofing risk', async () => {
    const sharedHash = 'shared-hash';
    const firstUser = randomUUID();
    const secondUser = randomUUID();

    await deviceService.ingest(samplePayload({ userId: firstUser, hash: sharedHash }));
    const result = await deviceService.ingest(
      samplePayload({ userId: secondUser, hash: sharedHash })
    );

    expect(result.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Fingerprint hash observed on other profiles. Possible device spoofing.',
          severity: ModerationSeverity.CRITICAL,
        }),
      ])
    );
    expect(result.fingerprint.riskLabel).toBe('high');

    const moderationEvents = await prisma.moderationEvent.findMany({
      where: { userId: secondUser },
    });
    expect(moderationEvents).toHaveLength(1);
    expect(moderationEvents[0]).toMatchObject({
      userId: secondUser,
      deviceFingerprintId: result.fingerprint.id,
      severity: ModerationSeverity.CRITICAL,
      message: 'Fingerprint hash observed on other profiles. Possible device spoofing.',
    });

    expect(auditService.deviceLogs).toEqual([
      {
        userId: secondUser,
        message: 'Fingerprint hash observed on other profiles. Possible device spoofing.',
        severity: ModerationSeverity.CRITICAL,
        deviceFingerprintId: expect.any(String),
      },
    ]);
  });

  it('surfaces shared fingerprint clusters when multiple users reuse same hash', async () => {
    const sharedHash = 'cluster-hash';
    const firstUser = randomUUID();
    const secondUser = randomUUID();

    await deviceService.ingest(samplePayload({ userId: firstUser, hash: sharedHash }));
    await deviceService.ingest(samplePayload({ userId: secondUser, hash: sharedHash }));

    const clusters = await deviceService.listSharedFingerprintClusters();

    expect(clusters).toHaveLength(1);
    const [cluster] = clusters;
    expect(cluster.hash).toBe(sharedHash);
    expect(cluster.members).toHaveLength(2);
    expect(cluster.members.map((member) => member.userId)).toEqual(
      expect.arrayContaining([firstUser, secondUser])
    );
  });
});
