import { DiscoverySpace } from '../../../common/enums/discovery-space.enum';
import { MatchPreference } from '../../../common/enums/match-preference.enum';
import { Orientation } from '../../../common/enums/orientation.enum';

export interface MatchCandidateDto {
  id: string;
  displayName: string;
  city: string;
  bio: string | null;
  photos: string[];
  trustScore: number;
  orientation: Orientation;
  matchPreferences: MatchPreference[];
  discoverySpace: DiscoverySpace;
  isVerified: boolean;
  compatibilityScore: number;
}
