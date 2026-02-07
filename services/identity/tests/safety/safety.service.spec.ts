import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SafetyService } from '../../src/modules/safety/safety.service';
import { PrismaService } from '../../src/prisma/prisma.service';

const createPrismaMock = () => ({
  safetyToolSetting: {
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
});

type PrismaMock = ReturnType<typeof createPrismaMock>;

describe('SafetyService tools', () => {
  let prisma: PrismaMock;
  let service: SafetyService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new SafetyService(prisma as unknown as PrismaService);
  });

  it('returns existing safety tools when found', async () => {
    prisma.safetyToolSetting.findUnique.mockResolvedValue({
      id: 'tool-1',
      userId: 'user-1',
      locationSharingEnabled: false,
    });

    const settings = await service.getSafetyTools('user-1');

    expect(settings?.id).toBe('tool-1');
    expect(prisma.safetyToolSetting.create).not.toHaveBeenCalled();
  });

  it('creates default safety tools when missing', async () => {
    prisma.safetyToolSetting.findUnique.mockResolvedValue(null);
    prisma.safetyToolSetting.create.mockResolvedValue({
      id: 'new-tools',
      userId: 'user-1',
      locationSharingEnabled: false,
    });

    const settings = await service.getSafetyTools('user-1');

    expect(prisma.safetyToolSetting.create).toHaveBeenCalledWith({ data: { userId: 'user-1' } });
    expect(settings?.id).toBe('new-tools');
  });

  it('upserts emergency contact information', async () => {
    await service.updateEmergencyContact('user-1', {
      name: 'Jordan',
      phone: '+1234567890',
      relationship: 'Roommate',
    });

    expect(prisma.safetyToolSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        create: expect.objectContaining({ emergencyContactName: 'Jordan' }),
        update: expect.objectContaining({ emergencyContactPhone: '+1234567890' }),
      })
    );
  });

  it('updates location sharing toggles', async () => {
    await service.updateLocationSharing('user-1', { enabled: true });

    expect(prisma.safetyToolSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ locationSharingEnabled: true }),
        update: expect.objectContaining({ locationSharingEnabled: true }),
      })
    );
  });
});
