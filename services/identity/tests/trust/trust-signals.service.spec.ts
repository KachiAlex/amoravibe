import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrustSignalsService } from '../../src/modules/trust/services/trust-signals.service';
import { RiskScoringService } from '../../src/modules/trust/services/risk-scoring.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  RiskSignalChannel,
  RiskSignalSeverity,
  RiskSignalType,
} from '../../src/common/enums/risk.enums';
import { CreateRiskSignalDto } from '../../src/modules/trust/dto/create-risk-signal.dto';
import { RiskSignal } from '../../src/prisma/client';

const buildDto = (overrides: Partial<CreateRiskSignalDto> = {}): CreateRiskSignalDto => ({
  userId: 'user-1',
  type: RiskSignalType.DEVICE_FINGERPRINT,
  channel: RiskSignalChannel.DEVICE_PIPELINE,
  severity: RiskSignalSeverity.MEDIUM,
  features: [
    { key: 'matching_accounts', value: 3 },
    { key: 'shared_device_ratio', value: 0.8 },
  ],
  metadata: { fingerprint: 'fp-123' },
  ...overrides,
});

describe('TrustSignalsService', () => {
  let prisma: PrismaService;
  let scoring: RiskScoringService;
  let service: TrustSignalsService;
  let createMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createMock = vi.fn();
    prisma = {
      riskSignal: {
        create: createMock,
      },
    } as unknown as PrismaService;

    scoring = {
      evaluateSignal: vi.fn(),
    } as unknown as RiskScoringService;

    service = new TrustSignalsService(prisma, scoring);
  });

  it('normalizes features payloads and forwards the signal to the scoring service', async () => {
    const dto = buildDto();
    const savedSignal = {
      id: 'sig-1',
      userId: dto.userId,
    } as RiskSignal;

    createMock.mockResolvedValue(savedSignal);

    await service.ingestSignal(dto);

    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        features: { matching_accounts: 3, shared_device_ratio: 0.8 },
      }),
    });
    expect(scoring.evaluateSignal).toHaveBeenCalledWith(savedSignal);
  });

  it('skips scoring when the signal is not associated with a user', async () => {
    const dto = buildDto({ userId: undefined });
    const savedSignal = {
      id: 'sig-2',
      userId: null,
    } as RiskSignal;

    createMock.mockResolvedValue(savedSignal);

    await service.ingestSignal(dto);

    expect(scoring.evaluateSignal).not.toHaveBeenCalled();
  });
});
