import { describe, expect, it } from 'vitest';
import { Orientation } from '../../src/common/enums/orientation.enum';
import { OrientationPolicyService } from '../../src/modules/policy/services/orientation-policy.service';

const service = new OrientationPolicyService();

describe('OrientationPolicyService', () => {
  it('allows verified heterosexual users into heterosexual pool', () => {
    const allowed = service.validateAccess({
      requestedPool: Orientation.HETEROSEXUAL,
      userOrientation: Orientation.HETEROSEXUAL,
      verified: true,
    });

    expect(allowed).toBe(true);
  });

  it('blocks unverified users regardless of pool', () => {
    const allowed = service.validateAccess({
      requestedPool: Orientation.GAY,
      userOrientation: Orientation.GAY,
      verified: false,
    });

    expect(allowed).toBe(false);
  });

  it('blocks verified LGBTQ users from heterosexual pool', () => {
    const allowed = service.validateAccess({
      requestedPool: Orientation.HETEROSEXUAL,
      userOrientation: Orientation.GAY,
      verified: true,
    });

    expect(allowed).toBe(false);
  });
});
