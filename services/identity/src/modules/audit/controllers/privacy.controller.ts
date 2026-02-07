import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { AuditApiKeyGuard } from '../guards/audit-api-key.guard';
import { CreateExportRequestDto } from '../dto/create-export-request.dto';
import { CreatePurgeRequestDto } from '../dto/create-purge-request.dto';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { AuditActorType, AuditEntityType } from '../../../prisma/audit.stubs';

interface AuditRequestResponse {
  id: string;
  requestedAt: Date;
  status: string;
}

const PRIVACY_CHANNEL = 'trust_privacy_api';
const PRIVACY_ACTOR_ID = 'trust_center';

@Controller('audit/privacy')
@UseGuards(AuditApiKeyGuard)
export class AuditPrivacyController {
  constructor(private readonly auditService: AuditService) {}

  @Post('exports')
  async createExportRequest(@Body() dto: CreateExportRequestDto): Promise<AuditRequestResponse> {
    // Disabled in SQLite dev mode
    return { id: 'n/a', requestedAt: new Date(), status: 'pending' };
  }

  @Post('purges')
  async createPurgeRequest(@Body() dto: CreatePurgeRequestDto): Promise<AuditRequestResponse> {
    // Disabled in SQLite dev mode
    return { id: 'n/a', requestedAt: new Date(), status: 'pending' };
  }

  private toResponse(id: string, requestedAt: Date, status: string): AuditRequestResponse {
    return { id, requestedAt, status };
  }
}
