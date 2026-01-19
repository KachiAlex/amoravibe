import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import { DeviceService } from '../../src/modules/device/services/device.service';
import { IngestDeviceFingerprintDto } from '../../src/modules/device/dto/ingest-device-fingerprint.dto';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';

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

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    deviceService = new DeviceService(prisma);
  });

  it('flags high device turnover for a user', async () => {
    const userId = randomUUID();

    // Seed three historical devices to hit the turnover threshold
    await deviceService.ingest(samplePayload({ userId }));
    await deviceService.ingest(samplePayload({ userId }));
    await deviceService.ingest(samplePayload({ userId }));

    const result = await deviceService.ingest(samplePayload({ userId }));

    expect(result.alerts).toContain('User has high device turnover. Review for account sharing.');
    expect(result.fingerprint.riskLabel).toBe('medium');
  });

  it('flags fingerprints reused across multiple users as spoofing risk', async () => {
    const sharedHash = 'shared-hash';
    const firstUser = randomUUID();
    const secondUser = randomUUID();

    await deviceService.ingest(samplePayload({ userId: firstUser, hash: sharedHash }));
    const result = await deviceService.ingest(
      samplePayload({ userId: secondUser, hash: sharedHash })
    );

    expect(result.alerts).toContain(
      'Fingerprint hash observed on other profiles. Possible device spoofing.'
    );
    expect(result.fingerprint.riskLabel).toBe('high');
  });
});
