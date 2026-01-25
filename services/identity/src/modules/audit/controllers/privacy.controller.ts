import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { AuditApiKeyGuard } from '../guards/audit-api-key.guard';
import { CreateExportRequestDto } from '../dto/create-export-request.dto';
import { CreatePurgeRequestDto } from '../dto/create-purge-request.dto';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { AuditActorType, AuditEntityType } from '../../../prisma/client';

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
    const request = await this.auditService.requestExport(dto.userId, dto.payload?.extra);

    await this.auditService.log({
      userId: dto.userId,
      action: AuditAction.DATA_EXPORT_REQUESTED,
      details: {
        exportRequestId: request.id,
        payload: dto.payload?.extra ?? null,
      },
      channel: PRIVACY_CHANNEL,
      actor: { type: AuditActorType.service, id: PRIVACY_ACTOR_ID },
      entity: { type: AuditEntityType.user, id: dto.userId },
    });

    return this.toResponse(request.id, request.requestedAt, request.status);
  }

  @Post('purges')
  async createPurgeRequest(@Body() dto: CreatePurgeRequestDto): Promise<AuditRequestResponse> {
    const request = await this.auditService.requestPurge(dto.userId, dto.reason);

    await this.auditService.log({
      userId: dto.userId,
      action: AuditAction.DATA_DELETION_REQUESTED,
      details: {
        purgeRequestId: request.id,
        reason: dto.reason ?? null,
      },
      channel: PRIVACY_CHANNEL,
      actor: { type: AuditActorType.service, id: PRIVACY_ACTOR_ID },
      entity: { type: AuditEntityType.user, id: dto.userId },
    });

    return this.toResponse(request.id, request.requestedAt, request.status);
  }

  private toResponse(id: string, requestedAt: Date, status: string): AuditRequestResponse {
    return { id, requestedAt, status };
  }
}
