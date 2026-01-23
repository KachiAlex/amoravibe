import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, $Enums } from '../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddCaseNoteDto,
  CaseQueryDto,
  CreateCaseDto,
  UpdateCaseStatusDto,
} from './dto/create-case.dto';
import { CaseEventType, ModerationCaseStatus } from '../../common/enums/moderation.enums';

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCaseDto) {
    return this.prisma.moderationCase.create({
      data: {
        severity: dto.severity,
        source: dto.source,
        category: dto.category,
        summary: dto.summary,
        description: dto.description,
        reporterUserId: dto.reporterUserId,
        reportedUserId: dto.reportedUserId,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        events: {
          create: dto.reporterUserId
            ? [
                {
                  type: CaseEventType.NOTE,
                  actorId: dto.reporterUserId,
                  payload: { note: 'Case opened from user report' } as Prisma.InputJsonValue,
                },
              ]
            : undefined,
        },
      },
      include: this.defaultCaseInclude(),
    });
  }

  async findMany(query: CaseQueryDto) {
    const where: Prisma.ModerationCaseWhereInput = {};

    if (query.status) {
      where.status = query.status as $Enums.ModerationCaseStatus;
    }
    if (query.severity) {
      where.severity = query.severity;
    }
    if (query.reportedUserId) {
      where.reportedUserId = query.reportedUserId;
    }
    if (query.search) {
      where.OR = [
        { summary: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.moderationCase.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      include: this.defaultCaseInclude({ includeEvents: false }),
    });
  }

  async findById(id: string) {
    const record = await this.prisma.moderationCase.findUnique({
      where: { id },
      include: this.defaultCaseInclude(),
    });
    if (!record) {
      throw new NotFoundException(`Case ${id} not found`);
    }
    return record;
  }

  async updateStatus(id: string, dto: UpdateCaseStatusDto) {
    await this.ensureCaseExists(id);

    const updates: Prisma.ModerationCaseUpdateInput = {
      status: dto.status,
      severity: dto.severity,
      assignedTo: dto.assignedTo,
    };
    if (
      dto.status === ModerationCaseStatus.CLOSED ||
      dto.status === ModerationCaseStatus.ACTION_TAKEN
    ) {
      updates.closedAt = new Date();
    }

    const updated = await this.prisma.moderationCase.update({
      where: { id },
      data: updates,
      include: this.defaultCaseInclude(),
    });

    await this.recordEvent(id, CaseEventType.STATUS_CHANGE, dto.assignedTo, {
      status: dto.status,
      severity: dto.severity,
      note: dto.note,
    });

    return updated;
  }

  async addNote(id: string, dto: AddCaseNoteDto) {
    await this.ensureCaseExists(id);
    await this.recordEvent(id, CaseEventType.NOTE, dto.actorId, { note: dto.note });
    return this.findById(id);
  }

  private async ensureCaseExists(id: string) {
    const exists = await this.prisma.moderationCase.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Case ${id} not found`);
    }
  }

  recordEvent(
    caseId: string,
    type: CaseEventType,
    actorId?: string,
    payload?: Record<string, unknown>
  ) {
    return this.prisma.caseEvent.create({
      data: {
        caseId,
        type,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private defaultCaseInclude(options: { includeEvents?: boolean } = { includeEvents: true }) {
    return {
      reports: true,
      events: options.includeEvents ? { orderBy: { createdAt: 'asc' } } : false,
      runs: { orderBy: { createdAt: 'desc' } },
    } satisfies Prisma.ModerationCaseInclude;
  }
}
