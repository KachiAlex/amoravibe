import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunityMembershipStatus, CommunityType, ReportReason } from '@prisma/client';

@Controller('api/v1/communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get(':communityId')
  async getCommunityDetail(
    @Param('communityId') communityId: string,
    @Query('userId') userId?: string
  ) {
    const community = await this.communitiesService.getCommunityDetail(communityId, userId);
    return { community };
  }

  @Get('browse')
  async browseCommunities(
    @Query('userId') userId: string,
    @Query('type') type?: CommunityType,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string
  ) {
    const communities = await this.communitiesService.browseCommunities(userId, {
      type,
      search,
      limit: limit ? parseInt(limit) : 20,
      skip: skip ? parseInt(skip) : 0,
    });

    return { communities, total: communities.length };
  }

  @Get('my-communities')
  async getUserCommunities(@Query('userId') userId: string, @Query('limit') limit?: string) {
    const communities = await this.communitiesService.getUserCommunities(
      userId,
      limit ? parseInt(limit) : 50
    );

    return { communities, total: communities.length };
  }

  @Post('eligibility')
  async evaluateEligibility(@Body() body: { userId: string; communityIds: string[] }) {
    const eligibility = await this.communitiesService.evaluateEligibilityForCommunities(
      body.userId,
      body.communityIds
    );

    return { eligibility };
  }

  @Post(':communityId/join')
  async joinCommunity(
    @Param('communityId') communityId: string,
    @Body() body: { userId: string }
  ) {
    const result = await this.communitiesService.joinCommunity(body.userId, communityId);
    const success = result.status === CommunityMembershipStatus.active;
    return { ...result, success, message: success ? 'Joined community' : 'Failed to join' };
  }

  @Post(':communityId/leave')
  async leaveCommunity(
    @Param('communityId') communityId: string,
    @Body() body: { userId: string }
  ) {
    const success = await this.communitiesService.leaveCommunity(body.userId, communityId);
    return { success, message: success ? 'Left community' : 'Failed to leave' };
  }

  @Get(':communityId/posts')
  async getCommunityPosts(
    @Param('communityId') communityId: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    const feed = await this.communitiesService.getCommunityPosts(
      communityId,
      userId,
      limit ? parseInt(limit) : 20,
      cursor
    );

    return feed;
  }

  @Post(':communityId/posts')
  async createPost(
    @Param('communityId') communityId: string,
    @Body() body: { userId: string; content: string; media?: { url: string; mimeType: string; width?: number; height?: number }[] }
  ) {
    const postId = await this.communitiesService.createPost(
      communityId,
      body.userId,
      body.content,
      body.media
    );
    return { success: !!postId, postId, message: postId ? 'Post created' : 'Failed to create post' };
  }

  @Post(':communityId/posts/:postId/comments')
  async commentOnPost(
    @Param('communityId') communityId: string,
    @Param('postId') postId: string,
    @Body() body: { userId: string; content: string }
  ) {
    const commentId = await this.communitiesService.commentOnPost(postId, body.userId, body.content);
    return { success: !!commentId, commentId, message: commentId ? 'Comment added' : 'Failed to add comment' };
  }

  @Post(':communityId/posts/:postId/react')
  async reactToPost(
    @Param('communityId') communityId: string,
    @Param('postId') postId: string,
    @Body() body: { userId: string; type?: string }
  ) {
    const success = await this.communitiesService.reactToPost(postId, body.userId, body.type || 'like');
    return { success, message: success ? 'Reaction added' : 'Failed to react' };
  }

  @Post(':communityId/posts/:postId/report')
  async reportPost(
    @Param('communityId') communityId: string,
    @Param('postId') postId: string,
    @Body()
    body: { userId: string; reason: ReportReason; description?: string; evidence?: string[] }
  ) {
    const reportId = await this.communitiesService.reportPost(
      postId,
      body.userId,
      body.reason,
      body.description,
      body.evidence
    );

    return { success: !!reportId, reportId };
  }

  @Get(':communityId/members')
  async getCommunityMembers(
    @Param('communityId') communityId: string,
    @Query('limit') limit?: string
  ) {
    const members = await this.communitiesService.getCommunityMembers(
      communityId,
      limit ? parseInt(limit) : 50
    );

    return { members, total: members.length };
  }

  @Get(':communityId/user-role')
  async getUserRole(
    @Param('communityId') communityId: string,
    @Query('userId') userId: string
  ) {
    const role = await this.communitiesService.getUserRoleInCommunity(userId, communityId);
    return { role };
  }

  @Post(':communityId/freeze')
  async freezeCommunity(
    @Param('communityId') communityId: string,
    @Body() body: { actorId: string; reason: string }
  ) {
    const success = await this.communitiesService.freezeCommunity(communityId, body.actorId, body.reason);
    return { success };
  }

  @Post(':communityId/unfreeze')
  async unfreezeCommunity(@Param('communityId') communityId: string, @Body() body: { actorId: string }) {
    const success = await this.communitiesService.unfreezeCommunity(communityId, body.actorId);
    return { success };
  }

  @Post(':communityId/archive')
  async archiveCommunity(
    @Param('communityId') communityId: string,
    @Body() body: { actorId: string; reason: string }
  ) {
    const success = await this.communitiesService.archiveCommunity(communityId, body.actorId, body.reason);
    return { success };
  }

  @Post(':communityId/members/:memberId/ban')
  async banMember(
    @Param('communityId') communityId: string,
    @Param('memberId') memberId: string,
    @Body() body: { actorId: string; reason: string; durationMinutes?: number }
  ) {
    const success = await this.communitiesService.banMember(
      communityId,
      memberId,
      body.actorId,
      body.reason,
      body.durationMinutes
    );

    return { success };
  }
}
