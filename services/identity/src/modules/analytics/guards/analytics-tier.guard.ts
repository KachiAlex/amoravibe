import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AnalyticsPiiTier } from '../../../prisma/client';

const TIER_ORDER: AnalyticsPiiTier[] = [
  AnalyticsPiiTier.aggregate,
  AnalyticsPiiTier.hashed,
  AnalyticsPiiTier.direct,
];

const normalizeHeader = (value?: string | string[]): string | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
};

const parseTier = (raw?: string | string[]): AnalyticsPiiTier | null => {
  const value = normalizeHeader(raw);
  if (!value) {
    return null;
  }
  const normalized = value.toLowerCase();
  return TIER_ORDER.find((tier) => tier === normalized) ?? null;
};

const tierIndex = (tier: AnalyticsPiiTier): number => TIER_ORDER.indexOf(tier);

@Injectable()
export class AnalyticsTierGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      query: Record<string, string | string[] | undefined>;
      analyticsTier?: AnalyticsPiiTier;
      analyticsActorId?: string;
    }>();

    const headerTier = parseTier(request.headers['x-analytics-tier']);
    if (!headerTier) {
      throw new ForbiddenException('Missing or invalid analytics tier header');
    }

    const actorId = normalizeHeader(request.headers['x-analytics-actor-id']);
    if (!actorId) {
      throw new ForbiddenException('Missing analytics actor identifier');
    }

    const requestedTier = parseTier(request.query.maxPiiTier);
    if (requestedTier && tierIndex(requestedTier) > tierIndex(headerTier)) {
      throw new ForbiddenException('Requested tier exceeds allowed analytics tier');
    }

    request.analyticsTier = headerTier;
    request.analyticsActorId = actorId;
    return true;
  }
}
