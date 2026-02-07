import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchService } from '../match/match.service';
import { MatchCandidateDto } from '../match/dto/match.dto';
import {
  DISCOVER_FILTER_PRESETS,
  DiscoverCardDto,
  DiscoverFeedMode,
  DiscoverFeedResponseDto,
  DiscoverFilterOptionDto,
} from './dto/discover-feed.dto';
import { DiscoverEventDto } from './dto/discover-event.dto';
import { DiscoverEventAction, Prisma } from '../../prisma/client';

const DEFAULT_FEED_LIMIT = 9;
const MAX_FEED_LIMIT = 24;

@Injectable()
export class DiscoverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchService: MatchService
  ) {}

  async getFeed(
    userId: string,
    requestedMode?: DiscoverFeedMode,
    requestedLimit?: number
  ): Promise<DiscoverFeedResponseDto> {
    await this.ensureUser(userId);

    const mode = this.normalizeMode(requestedMode);
    const limit = this.normalizeLimit(requestedLimit);

    const candidates = await this.matchService.findMatches(userId, limit * 2);
    const cards = candidates.map((candidate) => this.mapToCard(candidate));
    const filteredCards = this.filterCards(cards, mode).slice(0, limit);

    const hero = filteredCards[0] ?? null;
    const featured = filteredCards.slice(1, 3);
    const grid = filteredCards.slice(3);

    const filters = await this.resolveFilters(mode);

    return {
      hero,
      featured,
      grid,
      filters,
      total: filteredCards.length,
      mode,
      generatedAt: new Date().toISOString(),
    };
  }

  async logEvent(dto: DiscoverEventDto): Promise<void> {
    await this.ensureUser(dto.userId);
    if (dto.cardUserId) {
      await this.ensureUser(dto.cardUserId, true);
    }

    await this.prisma.discoverEvent.create({
      data: {
        action: dto.action as DiscoverEventAction,
        userId: dto.userId,
        cardUserId: dto.cardUserId ?? null,
        surface: dto.surface ?? null,
        filter: dto.filter ?? null,
        latencyMs: dto.latencyMs ?? null,
        metadata: (dto.metadata as Prisma.JsonValue | null | undefined) ?? undefined,
      },
    });
  }

  private async resolveFilters(activeMode: DiscoverFeedMode): Promise<DiscoverFilterOptionDto[]> {
    const filters = await this.prisma.discoverFilter.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const resolved = filters.length
      ? filters.map((filter) => ({
          label: filter.label,
          helper: filter.helper,
          premium: filter.premium,
          value: this.deriveModeFromLabel(filter.label),
        }))
      : DISCOVER_FILTER_PRESETS;

    return resolved.map((filter) => ({
      ...filter,
      active: filter.value === activeMode,
    }));
  }

  private deriveModeFromLabel(label: string): DiscoverFeedMode {
    const normalized = label.toLowerCase();
    if (normalized.includes('verified')) {
      return 'verified';
    }
    if (normalized.includes('near')) {
      return 'nearby';
    }
    if (normalized.includes('new') || normalized.includes('fresh')) {
      return 'fresh';
    }
    if (normalized.includes('premium')) {
      return 'premium';
    }
    if (normalized.includes('shared') || normalized.includes('interest')) {
      return 'shared';
    }
    return 'default';
  }

  private mapToCard(candidate: MatchCandidateDto): DiscoverCardDto {
    const compatibility = Math.min(Math.max(Math.round(candidate.compatibilityScore ?? 0), 0), 100);
    return {
      id: candidate.id,
      name: candidate.displayName,
      age: null,
      city: candidate.city ?? null,
      cityRegion: candidate.cityRegion ?? candidate.city ?? null,
      distance: this.formatDistance(candidate.distanceKm),
      distanceKm: typeof candidate.distanceKm === 'number' ? candidate.distanceKm : null,
      tags: this.buildTags(candidate, compatibility),
      image:
        candidate.photos?.[0] ??
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      compatibility,
      verified: Boolean(candidate.isVerified),
      premiumOnly: compatibility >= 85,
      receiverId: candidate.id,
      actionable: true,
    };
  }

  private buildTags(candidate: MatchCandidateDto, compatibility: number): string[] {
    const tags: string[] = [];
    if (candidate.cityRegion) {
      tags.push(candidate.cityRegion);
    } else if (candidate.city) {
      tags.push(candidate.city);
    }
    tags.push(`${compatibility}% vibe`);
    if (candidate.matchPreferences?.length) {
      tags.push(candidate.matchPreferences[0]?.replace(/_/g, ' '));
    }
    return tags.filter(Boolean);
  }

  private filterCards(cards: DiscoverCardDto[], mode: DiscoverFeedMode): DiscoverCardDto[] {
    const sorter = (a: DiscoverCardDto, b: DiscoverCardDto) => b.compatibility - a.compatibility;

    switch (mode) {
      case 'verified':
        return cards.filter((card) => card.verified).sort(sorter);
      case 'nearby':
        return cards
          .filter((card) => typeof card.distanceKm === 'number')
          .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      case 'fresh':
        return cards.slice().reverse();
      case 'premium':
        return cards.filter((card) => card.premiumOnly || card.verified).sort(sorter);
      case 'shared':
        return cards.filter((card) => card.tags.length >= 2).sort(sorter);
      case 'default':
      default:
        return cards.sort(sorter);
    }
  }

  private formatDistance(distanceKm?: number | null): string | null {
    if (typeof distanceKm !== 'number' || Number.isNaN(distanceKm)) {
      return null;
    }
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${Math.round(distanceKm)} km`;
  }

  private normalizeMode(mode?: DiscoverFeedMode): DiscoverFeedMode {
    const allowed: DiscoverFeedMode[] = [
      'default',
      'verified',
      'nearby',
      'fresh',
      'premium',
      'shared',
    ];
    return mode && allowed.includes(mode) ? mode : 'default';
  }

  private normalizeLimit(limit?: number): number {
    if (!limit || Number.isNaN(limit)) {
      return DEFAULT_FEED_LIMIT;
    }
    return Math.max(3, Math.min(limit, MAX_FEED_LIMIT));
  }

  private async ensureUser(userId: string, optional = false): Promise<void> {
    try {
      if (!this.prisma.isConnected()) {
        // DB unavailable during local dev - skip strict user checks
        // eslint-disable-next-line no-console
        console.warn('[DiscoverService] Prisma not connected, skipping user existence check');
        return;
      }

      const exists = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!exists && !optional) {
        throw new NotFoundException(`User ${userId} not found`);
      }
    } catch (err) {
      // If DB errors occur, treat as dev fallback rather than failing the request
      // eslint-disable-next-line no-console
      console.error('[DiscoverService] Error ensuring user:', err);
      if (!optional) return;
    }
  }
}
