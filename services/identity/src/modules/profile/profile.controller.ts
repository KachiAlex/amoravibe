import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('api/v1/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('public')
  async getPublic(@Query('userId') userId: string) {
    const profile = await this.profileService.getPublicProfile(userId);
    return { success: true, profile };
  }

  @Post('public')
  async updatePublic(@Body() body: { userId: string; displayName?: string; bio?: string; location?: string }) {
    const profile = await this.profileService.updatePublicProfile(body.userId, body);
    return { success: true, profile };
  }

  @Get('private')
  async getPrivate(@Query('userId') userId: string) {
    const profile = await this.profileService.getPrivateProfile(userId);
    return { success: true, profile };
  }

  @Post('private')
  async updatePrivate(
    @Body()
    body: {
      userId: string;
      genderIdentity?: string;
      sexualOrientation?: string;
      pronouns?: string;
      relationshipGoal?: string;
    },
  ) {
    const profile = await this.profileService.updatePrivateProfile(body.userId, body);
    return { success: true, profile };
  }
}
