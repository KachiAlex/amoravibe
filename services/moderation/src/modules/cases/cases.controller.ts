import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CasesService } from './cases.service';
import {
  AddCaseNoteDto,
  CaseQueryDto,
  CreateCaseDto,
  UpdateCaseStatusDto,
} from './dto/create-case.dto';

@Controller('cases')
export class CasesController {
  constructor(private readonly cases: CasesService) {}

  @Get()
  list(@Query() query: CaseQueryDto) {
    return this.cases.findMany(query);
  }

  @Get(':id')
  getOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cases.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCaseDto) {
    return this.cases.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCaseStatusDto) {
    return this.cases.updateStatus(id, dto);
  }

  @Post(':id/notes')
  addNote(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AddCaseNoteDto) {
    return this.cases.addNote(id, dto);
  }
}
