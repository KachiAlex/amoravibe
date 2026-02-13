import { Module } from '@nestjs/common';
import { DebugCorsController } from './debug-cors.controller';

@Module({
  controllers: [DebugCorsController],
})
export class DebugModule {}
