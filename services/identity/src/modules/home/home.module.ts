import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { PolicyModule } from '../policy/policy.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PolicyModule, UserModule],
  controllers: [HomeController],
})
export class HomeModule {}
