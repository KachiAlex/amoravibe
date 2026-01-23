import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';

@Module({
  imports: [PrismaModule],
  providers: [CasesService],
  controllers: [CasesController],
  exports: [CasesService],
})
export class CasesModule {}
