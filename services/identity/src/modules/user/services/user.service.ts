import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';
import { UserProfile } from '../user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { Orientation } from '../../../common/enums/orientation.enum';
import { DiscoverySpace } from '../../../common/enums/discovery-space.enum';
import { MatchPreference } from '../../../common/enums/match-preference.enum';
import { VisibilityStatus } from '../../../common/enums/visibility-status.enum';
import { hashPassword } from '../password.utils';

const MIN_AGE = 18;
const MAX_PHOTOS = 6;
const TRUST_BASELINE = 50;

@Injectable()
export class UserService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(dto: CreateUserDto): Promise<UserProfile> {
    this.assertContactProvided(dto);
    this.assertAdult(dto.dateOfBirth);
    this.assertPhotos(dto.photos);
    this.assertOrientationPreferences(dto.orientation, dto.orientationPreferences);
    this.assertDiscoverySpaceEligibility(dto.orientation, dto.discoverySpace);
    this.assertMatchPreferences(dto.matchPreferences);

    const passwordHash = hashPassword(dto.password);
    const dateOfBirth = new Date(dto.dateOfBirth);

    try {
      return await this.prisma.user.create({
        // Cast `data` to `any` temporarily to avoid TypeScript mismatches
        // with the generated Prisma client while we reconcile schema.
        data: {
          legalName: dto.legalName,
          displayName: dto.displayName,
          dateOfBirth,
          email: dto.email ?? null,
          phone: dto.phone ?? null,
          passwordHash,
          gender: dto.gender,
          orientation: dto.orientation,
          orientationPreferences: dto.orientationPreferences,
          discoverySpace: dto.discoverySpace,
          matchPreferences: dto.matchPreferences,
          city: dto.city,
          cityCountry: dto.cityCountry ?? null,
          cityCountryCode: dto.cityCountryCode ?? null,
          cityRegion: dto.cityRegion ?? null,
          cityRegionCode: dto.cityRegionCode ?? null,
          cityTimezone: dto.cityTimezone ?? null,
          cityLat: dto.cityLat ?? null,
          cityLng: dto.cityLng ?? null,
          locationAccuracyMeters: dto.locationAccuracyMeters ?? null,
          locationUpdatedAt: dto.locationUpdatedAt ? new Date(dto.locationUpdatedAt) : null,
          bio: dto.bio,
          photos: dto.photos as Prisma.JsonArray,
          verificationIntent: dto.verificationIntent,
          trustScore: TRUST_BASELINE,
          visibility: VisibilityStatus.LIMITED,
          isVerified: false,
        } as any,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? (error.meta?.target as string[]) : [];
        const field = target.includes('phone') ? 'phone number' : 'email address';
        throw new BadRequestException(
          `An account already exists for this ${field}. Please sign in.`
        );
      }
      throw error;
    }
  }

  findById(id: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  markVerified(id: string): Promise<UserProfile> {
    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  private assertContactProvided(dto: CreateUserDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Provide an email address or phone number.');
    }
  }

  private assertAdult(dateIso: string) {
    const dob = new Date(dateIso);
    if (Number.isNaN(dob.getTime())) {
      throw new BadRequestException('Invalid date of birth.');
    }
    const today = new Date();
    const age =
      today.getFullYear() - dob.getFullYear() - (this.hasntHadBirthdayYet(today, dob) ? 1 : 0);
    if (age < MIN_AGE) {
      throw new BadRequestException('You must be at least 18 years old to join.');
    }
  }

  private hasntHadBirthdayYet(today: Date, dob: Date): boolean {
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0) return true;
    if (monthDiff > 0) return false;
    return today.getDate() < dob.getDate();
  }

  private assertPhotos(photos: string[]) {
    if (!Array.isArray(photos) || photos.length === 0) {
      throw new BadRequestException('Add at least one profile photo.');
    }
    if (photos.length > MAX_PHOTOS) {
      throw new BadRequestException(`You can upload at most ${MAX_PHOTOS} photos.`);
    }
  }

  private assertOrientationPreferences(userOrientation: Orientation, prefs: Orientation[]) {
    if (!prefs.includes(userOrientation)) {
      throw new BadRequestException(
        'Orientation preferences must include your stated orientation.'
      );
    }
  }

  private assertDiscoverySpaceEligibility(orientation: Orientation, space: DiscoverySpace) {
    const isStraight = orientation === Orientation.STRAIGHT;
    const isQueer = orientation === Orientation.GAY || orientation === Orientation.LESBIAN;
    const isFluid =
      orientation === Orientation.BISEXUAL ||
      orientation === Orientation.PANSEXUAL ||
      orientation === Orientation.QUEER;

    if (space === DiscoverySpace.STRAIGHT && !isStraight) {
      throw new BadRequestException('Only heterosexual members can appear in the straight space.');
    }

    if (space === DiscoverySpace.LGBTQ && isStraight) {
      throw new BadRequestException('Straight members cannot appear in the LGBTQ space.');
    }

    if (space === DiscoverySpace.BOTH && !isFluid && !isQueer) {
      throw new BadRequestException(
        'Dual visibility is reserved for bisexual, pansexual, or queer members.'
      );
    }
  }

  private assertMatchPreferences(preferences: MatchPreference[]) {
    if (!preferences.length) {
      throw new BadRequestException('Select who you want to connect with.');
    }

    const includesEveryone = preferences.includes(MatchPreference.EVERYONE);
    if (includesEveryone && preferences.length > 1) {
      throw new BadRequestException('If you choose everyone, remove other options.');
    }
  }
}
