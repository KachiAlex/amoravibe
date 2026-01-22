import { describe, expect, it } from 'vitest';
import { Orientation } from '../../src/common/enums/orientation.enum';
import { DiscoverySpace } from '../../src/common/enums/discovery-space.enum';
import { OrientationPolicyService } from '../../src/modules/policy/services/orientation-policy.service';

const service = new OrientationPolicyService();

describe('OrientationPolicyService', () => {
  it('allows verified heterosexual users into straight pool', () => {
    const result = service.evaluateAccess({
      requestedPool: DiscoverySpace.STRAIGHT,
      userOrientation: Orientation.STRAIGHT,
      verified: true,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('blocks unverified users regardless of pool', () => {
    const result = service.evaluateAccess({
      requestedPool: DiscoverySpace.LGBTQ,
      userOrientation: Orientation.GAY,
      verified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/verification/i);
  });

  it('blocks verified LGBTQ users from heterosexual pool', () => {
    const result = service.evaluateAccess({
      requestedPool: DiscoverySpace.STRAIGHT,
      userOrientation: Orientation.GAY,
      verified: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/straight pool/i);
  });

  it('allows dual-visibility orientations into BOTH pool', () => {
    const result = service.evaluateAccess({
      requestedPool: DiscoverySpace.BOTH,
      userOrientation: Orientation.BISEXUAL,
      verified: true,
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('blocks straight members from BOTH pool despite verification', () => {
    const result = service.evaluateAccess({
      requestedPool: DiscoverySpace.BOTH,
      userOrientation: Orientation.STRAIGHT,
      verified: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/dual visibility/i);
  });
});
