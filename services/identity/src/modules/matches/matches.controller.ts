import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * GET /api/v1/matches/:userId
   * Get all matches for a user (active by default)
   */
  @Get(':userId')
  async getMatches(
    @Param('userId') userId: string,
    @Query('status') status: 'active' | 'archived' = 'active',
    @Query('limit') limit: string = '50'
  ) {
    const parsedLimit = Math.min(parseInt(limit) || 50, 100);

    let matches;
    if (status === 'archived') {
      matches = await this.matchesService.getArchivedMatches(userId, parsedLimit);
    } else {
      matches = await this.matchesService.getActiveMatches(userId, parsedLimit);
    }

    return {
      matches,
      total: matches.length,
      status,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * POST /api/v1/matches/:userId/unmatch
   * Unmatch (soft delete) a match
   */
  @Post(':userId/unmatch')
  async unmatch(
    @Param('userId') userId: string,
    @Body() body: { matchId: string }
  ) {
    const success = await this.matchesService.unmatch(userId, body.matchId);
    return {
      success,
      message: success ? 'Unmatched successfully' : 'Failed to unmatch',
    };
  }

  /**
   * DELETE /api/v1/matches/:userId/block
   * Block a user (hard delete match)
   */
  @Delete(':userId/block')
  async blockUser(
    @Param('userId') userId: string,
    @Body() body: { matchId: string; blockedUserId: string }
  ) {
    const success = await this.matchesService.blockUser(userId, body.blockedUserId, body.matchId);
    return {
      success,
      message: success ? 'User blocked successfully' : 'Failed to block user',
    };
  }

  /**
   * GET /api/v1/matches/:userId/check/:otherUserId
   * Check if two users have a mutual match
   */
  @Get(':userId/check/:otherUserId')
  async checkMatch(
    @Param('userId') userId: string,
    @Param('otherUserId') otherUserId: string
  ) {
    const match = await this.matchesService.checkMatch(userId, otherUserId);
    return {
      hasMatch: !!match,
      match: match || null,
    };
  }

  /**
   * POST /api/v1/matches/:userId/interact
   * Update last interaction timestamp
   */
  @Post(':userId/interact')
  async updateInteraction(
    @Param('userId') userId: string,
    @Body() body: { matchId: string }
  ) {
    const success = await this.matchesService.updateLastInteraction(body.matchId);
    return {
      success,
      message: success ? 'Interaction updated' : 'Failed to update interaction',
    };
  }
}
