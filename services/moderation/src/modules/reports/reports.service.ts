import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CasesService } from '../cases/cases.service';
import {
  AutomationTriggerType,
  CaseEventType,
  ModerationSeverity,
  ModerationSource,
} from '../../common/enums/moderation.enums';
import { Prisma } from '../../prisma/client';
import { AutomationService } from '../automation/automation.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly casesService: CasesService,
    private readonly automation: AutomationService
  ) {}

  async create(dto: CreateReportDto) {
    const caseId = dto.caseId ?? (await this.resolveCaseId(dto));

    const report = await this.prisma.caseReport.create({
      data: {
        caseId,
        reporterUserId: dto.reporterUserId,
        reportedUserId: dto.reportedUserId,
        channel: dto.channel,
        reason: dto.reason,
        details: dto.details,
        evidence: dto.evidence as Prisma.InputJsonValue | undefined,
      },
    });

    if (caseId) {
      await this.casesService.recordEvent(caseId, CaseEventType.NOTE, dto.reporterUserId, {
        note: `Report added via ${dto.channel}: ${dto.reason}`,
      });
    }

    await this.automation.triggerRules(AutomationTriggerType.REPORT_CREATED, {
      caseId: caseId ?? undefined,
      context: {
        reportId: report.id,
        channel: dto.channel,
        reason: dto.reason,
        reporterUserId: dto.reporterUserId,
        reportedUserId: dto.reportedUserId,
      },
    });

    return report;
  }

  listByCase(caseId: string) {
    return this.prisma.caseReport.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async resolveCaseId(dto: CreateReportDto) {
    if (!dto.reportedUserId) {
      return null;
    }

    const existingCase = await this.prisma.moderationCase.findFirst({
      where: {
        reportedUserId: dto.reportedUserId,
        status: { not: 'CLOSED' },
      },
      select: { id: true },
    });

    if (existingCase) {
      return existingCase.id;
    }

    const newCase = await this.casesService.create({
      severity: ModerationSeverity.MEDIUM,
      source: ModerationSource.USER_REPORT,
      category: dto.reason,
      summary: `Report for ${dto.reportedUserId ?? 'unknown user'}`,
      reporterUserId: dto.reporterUserId,
      reportedUserId: dto.reportedUserId,
      description: dto.details,
      metadata: dto.evidence,
    });

    return newCase.id;
  }
}
