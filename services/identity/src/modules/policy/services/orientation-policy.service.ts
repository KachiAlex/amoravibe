import { Injectable } from '@nestjs/common';
import { Orientation } from '../../../common/enums/orientation.enum';

export interface OrientationPolicyInput {
  requestedPool: Orientation;
  userOrientation: Orientation;
  verified: boolean;
}

@Injectable()
export class OrientationPolicyService {
  validateAccess(input: OrientationPolicyInput): boolean {
    if (input.requestedPool === Orientation.HETEROSEXUAL) {
      return input.userOrientation === Orientation.HETEROSEXUAL && input.verified;
    }

    return input.verified;
  }
}
