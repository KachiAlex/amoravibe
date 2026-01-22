import { Injectable } from '@nestjs/common';
import { Orientation } from '../../../common/enums/orientation.enum';
import { DiscoverySpace } from '../../../common/enums/discovery-space.enum';

export interface OrientationPolicyInput {
  requestedPool: DiscoverySpace;
  userOrientation: Orientation;
  verified: boolean;
}

export interface OrientationPolicyDecision {
  allowed: boolean;
  reason?: string;
}

@Injectable()
export class OrientationPolicyService {
  evaluateAccess(input: OrientationPolicyInput): OrientationPolicyDecision {
    if (!input.verified) {
      return {
        allowed: false,
        reason: 'Complete verification before entering curated pools.',
      };
    }

    if (input.requestedPool === DiscoverySpace.STRAIGHT) {
      if (input.userOrientation !== Orientation.STRAIGHT) {
        return {
          allowed: false,
          reason: 'Only heterosexual members may appear in the straight pool.',
        };
      }
    }

    if (input.requestedPool === DiscoverySpace.LGBTQ) {
      if (input.userOrientation === Orientation.STRAIGHT) {
        return {
          allowed: false,
          reason: 'Straight members cannot appear in the LGBTQ pool.',
        };
      }
    }

    if (input.requestedPool === DiscoverySpace.BOTH) {
      const dualVisibilityEligible = [
        Orientation.BISEXUAL,
        Orientation.PANSEXUAL,
        Orientation.QUEER,
      ];
      if (!dualVisibilityEligible.includes(input.userOrientation)) {
        return {
          allowed: false,
          reason: 'Dual visibility is reserved for bisexual, pansexual, or queer members.',
        };
      }
    }

    return { allowed: true };
  }
}
