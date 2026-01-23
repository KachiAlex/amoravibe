import { Body, Controller, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { BootstrapProfileDto } from './dto/bootstrap-profile.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  bootstrap(@Body() dto: BootstrapProfileDto) {
    return this.profileService.bootstrap(dto);
  }
}
