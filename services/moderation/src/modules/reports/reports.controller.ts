import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  create(@Body() dto: CreateReportDto) {
    return this.reports.create(dto);
  }

  @Get('case/:caseId')
  listForCase(@Param('caseId', new ParseUUIDPipe()) caseId: string) {
    return this.reports.listByCase(caseId);
  }
}
