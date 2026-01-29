import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { LikeActionDto } from './dto/like-action.dto';
import { NotificationToggleDto } from './dto/notification-toggle.dto';

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagement: EngagementService) {}

  @Get('dashboard/:userId')
  getDashboard(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.engagement.getDashboard(userId);
  }

  @Post('likes')
  applyLike(@Body() dto: LikeActionDto) {
    return this.engagement.applyLikeAction(dto);
  }

  @Post('likes/:id/nudge')
  nudgeLike(@Param('id', new ParseUUIDPipe()) likeId: string) {
    return this.engagement.nudgeLike(likeId);
  }

  @Patch('notifications/:channel')
  toggleNotification(@Param('channel') channel: string, @Body() dto: NotificationToggleDto) {
    return this.engagement.toggleNotification(channel, dto);
  }
}
