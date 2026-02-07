import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { MatchService } from './match.service';

// Stub data for development when real data isn't available
const STUB_CANDIDATES = [
  {
    id: 'stub-1',
    displayName: 'Alex',
    city: 'San Francisco',
    cityRegion: 'Bay Area',
    bio: 'Love hiking and coffee',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    ],
    trustScore: 85,
    orientation: 'heterosexual',
    matchPreferences: ['women'],
    discoverySpace: 'STRAIGHT',
    isVerified: true,
    compatibilityScore: 78,
    distanceKm: 5,
  },
  {
    id: 'stub-2',
    displayName: 'Jordan',
    city: 'San Francisco',
    cityRegion: 'Mission',
    bio: 'Artist and adventurer',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    ],
    trustScore: 72,
    orientation: 'heterosexual',
    matchPreferences: ['women'],
    discoverySpace: 'STRAIGHT',
    isVerified: false,
    compatibilityScore: 65,
    distanceKm: 8,
  },
];

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get(':userId')
  async getMatches(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 12;

    try {
      const candidates = await this.matchService.findMatches(userId, parsedLimit);
      return {
        candidates,
        total: candidates.length,
        hasMore: candidates.length >= parsedLimit,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      // If user not found or no matches, return stub data for development
      console.log(`No real matches for ${userId}, returning stub data`);
      const stubCandidates = STUB_CANDIDATES.slice(0, parsedLimit);
      return {
        candidates: stubCandidates,
        total: stubCandidates.length,
        hasMore: false,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  @Post('action')
  async recordAction(
    @Body() body: { senderId: string; receiverId: string; action: string; highlight?: string }
  ) {
    try {
      return await this.matchService.recordAction(body.senderId, body.receiverId, body.action, body.highlight);
    } catch (error) {
      console.error(`Failed to record action:`, error);
      return { success: false, error: (error as Error).message };
    }
  }
}
