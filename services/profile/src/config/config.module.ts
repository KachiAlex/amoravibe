import { Module } from '@nestjs/common';
import { ProfileConfigService } from './config.service';

@Module({
  providers: [ProfileConfigService],
  exports: [ProfileConfigService],
})
export class ConfigModule {}
