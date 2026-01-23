import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ConfigModule } from './config/config.module';
import { MediaModule } from './modules/media/media.module';
import { VisibilityModule } from './modules/visibility/visibility.module';

@Module({
  imports: [ConfigModule, PrismaModule, ProfileModule, MediaModule, VisibilityModule],
})
export class AppModule {}
