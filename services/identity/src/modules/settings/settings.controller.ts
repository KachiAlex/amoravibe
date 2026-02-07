import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('api/v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Query('userId') userId: string) {
    const payload = await this.settingsService.getSettings(userId);
    return { success: true, ...payload };
  }

  @Post()
  async saveSettings(@Body() dto: UpdateSettingsDto) {
    const payload = await this.settingsService.upsertSettings(dto.userId, dto);
    return { success: true, message: 'Settings saved', ...payload };
  }
}
