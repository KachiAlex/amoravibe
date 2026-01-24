import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, $Enums } from '../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CasesService } from '../cases/cases.service';
import {
  AutomationActionType,
  AutomationTriggerType,
  ModerationCaseStatus,
  ModerationSeverity,
} from '../../common/enums/moderation.enums';
import {
  AutomationActionConfig,
  CreateAutomationRuleDto,
  RunAutomationDto,
  UpdateAutomationRuleDto,
} from './dto/automation-rule.dto';
import { AddCaseNoteDto, UpdateCaseStatusDto } from '../cases/dto/create-case.dto';

const severityRank: Record<ModerationSeverity, number> = {
  [ModerationSeverity.LOW]: 0,
  [ModerationSeverity.MEDIUM]: 1,
  [ModerationSeverity.HIGH]: 2,
  [ModerationSeverity.CRITICAL]: 3,
};

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);
  private readonly ruleInclude = {
    runs: { orderBy: { createdAt: 'desc' }, take: 20 },
  } satisfies Prisma.AutomationRuleInclude;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cases: CasesService
  ) {}

  createRule(dto: CreateAutomationRuleDto) {
    return this.prisma.automationRule.create({
      data: this.serializeRule(dto),
      include: this.ruleInclude,
    });
  }

  listRules() {
    return this.prisma.automationRule.findMany({
      include: this.ruleInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRule(id: string) {
    const record = await this.prisma.automationRule.findUnique({
      where: { id },
      include: this.ruleInclude,
    });
    if (!record) {
      throw new NotFoundException(`Automation rule ${id} not found`);
    }
    return record;
  }

  updateRule(id: string, dto: UpdateAutomationRuleDto) {
    return this.prisma.automationRule.update({
      where: { id },
      data: this.serializeRule(dto),
      include: this.ruleInclude,
    });
  }

  deleteRule(id: string) {
    return this.prisma.automationRule.delete({ where: { id } });
  }

  async runRule(id: string, dto: RunAutomationDto) {
    const rule = await this.getRule(id);
    if (!rule.active) {
      throw new BadRequestException('Rule is disabled');
    }

    await this.executeRule(rule, dto);
    return this.getRule(id);
  }

  async triggerRules(trigger: AutomationTriggerType, dto: RunAutomationDto = {}) {
    const rules = await this.prisma.automationRule.findMany({
      where: { trigger, active: true },
      include: this.ruleInclude,
    });

    for (const rule of rules) {
      await this.executeRule(rule, dto);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduled() {
    await this.triggerRules(AutomationTriggerType.SCHEDULED, {});
  }

  private serializeRule(dto: Partial<CreateAutomationRuleDto & UpdateAutomationRuleDto>) {
    const data: Prisma.AutomationRuleUncheckedCreateInput &
      Prisma.AutomationRuleUncheckedUpdateInput = {} as never;

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.trigger !== undefined) data.trigger = dto.trigger;
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.conditions !== undefined) {
      data.conditions = this.toJson(dto.conditions ?? null);
    }
    if (dto.action !== undefined) {
      data.action = this.toJson(dto.action);
    }

    return data;
  }

  private async executeRule(rule: AutomationRuleRecord, dto: RunAutomationDto) {
    const run = await this.prisma.automationRun.create({
      data: {
        ruleId: rule.id,
        caseId: dto.caseId ?? null,
        status: 'running',
        details: this.toJson({ input: dto }),
      },
    });

    try {
      const caseRecord = dto.caseId ? await this.loadCase(dto.caseId) : null;
      const context = { ...dto.context, case: caseRecord } as Record<string, unknown>;

      if (!this.evaluateConditions(rule.conditions, caseRecord)) {
        await this.prisma.automationRun.update({
          where: { id: run.id },
          data: {
            status: 'skipped',
            details: this.toJson({ input: dto, reason: 'Conditions not met' }),
          },
        });
        return;
      }

      const action = this.parseAction(rule.action);

      if (!action) {
        throw new BadRequestException('Automation action payload invalid');
      }

      await this.executeAction(action, {
        ...dto,
        context,
      });

      await this.prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'success',
          details: this.toJson({ input: dto, result: 'Rule executed' }),
        },
      });
    } catch (error) {
      this.logger.error(`Automation rule ${rule.id} failed`, error as Error);
      await this.prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          details: this.toJson({ input: dto, error: (error as Error).message }),
        },
      });
      throw error;
    }
  }

  private evaluateConditions(conditions: Prisma.JsonValue | null, caseRecord: CaseSnapshot | null) {
    if (!conditions) {
      return true;
    }

    const config = this.parseConditions(conditions);
    if (!config) {
      return true;
    }

    if (config.minimumSeverity && caseRecord) {
      const severity = this.toDomainSeverity(caseRecord.severity);
      if (severityRank[severity] < severityRank[config.minimumSeverity]) {
        return false;
      }
    }

    if (config.statusIn && caseRecord) {
      const status = this.toDomainStatus(caseRecord.status);
      if (!config.statusIn.includes(status)) {
        return false;
      }
    }

    if (config.reportedUserId && caseRecord) {
      if (caseRecord.reportedUserId !== config.reportedUserId) {
        return false;
      }
    }

    return true;
  }

  private async loadCase(id: string) {
    try {
      const record = await this.prisma.moderationCase.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          severity: true,
          reportedUserId: true,
        },
      });
      if (!record) {
        throw new NotFoundException('Case not found');
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Case not found');
    }
  }

  private async executeAction(action: AutomationActionConfig | undefined, dto: RunAutomationDto) {
    if (!action) {
      throw new BadRequestException('Automation action is missing');
    }

    switch (action.type) {
      case AutomationActionType.ESCALATE_CASE:
        return this.handleEscalationAction(dto.caseId, action);
      case AutomationActionType.AUTO_CLOSE_CASE:
        return this.handleAutoCloseAction(dto.caseId, action);
      case AutomationActionType.ADD_CASE_NOTE:
        return this.handleNoteAction(dto.caseId, action);
      default:
        throw new BadRequestException(`Unhandled automation action: ${action.type}`);
    }
  }

  private async handleEscalationAction(caseId: string | undefined, action: AutomationActionConfig) {
    const targetCaseId = this.ensureCaseId(caseId);
    const params = (action.params ?? {}) as Record<string, unknown>;

    const update: UpdateCaseStatusDto = {
      status: ModerationCaseStatus.INVESTIGATING,
      severity: (params.severity as ModerationSeverity) ?? ModerationSeverity.HIGH,
      assignedTo: params.assignedTo as string | undefined,
      note: (params.note as string) ?? 'Escalated automatically',
    };

    await this.cases.updateStatus(targetCaseId, update);
  }

  private async handleAutoCloseAction(caseId: string | undefined, action: AutomationActionConfig) {
    const targetCaseId = this.ensureCaseId(caseId);
    const params = (action.params ?? {}) as Record<string, unknown>;

    const update: UpdateCaseStatusDto = {
      status: ModerationCaseStatus.CLOSED,
      severity: (params.severity as ModerationSeverity) ?? ModerationSeverity.MEDIUM,
      note: (params.note as string) ?? 'Closed automatically',
    };

    await this.cases.updateStatus(targetCaseId, update);
  }

  private async handleNoteAction(caseId: string | undefined, action: AutomationActionConfig) {
    const targetCaseId = this.ensureCaseId(caseId);
    const params = (action.params ?? {}) as Record<string, unknown>;

    const note: AddCaseNoteDto = {
      note: (params.note as string) ?? 'Automated note added',
      actorId: params.actorId as string | undefined,
    };

    await this.cases.addNote(targetCaseId, note);
  }

  private ensureCaseId(caseId?: string) {
    if (!caseId) {
      throw new BadRequestException('Automation action requires a case context');
    }
    return caseId;
  }

  private toJson(payload: unknown): Prisma.InputJsonValue {
    return (payload ?? null) as unknown as Prisma.InputJsonValue;
  }

  private parseConditions(value: Prisma.JsonValue | null): RuleConditions | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as RuleConditions;
  }

  private parseAction(value: Prisma.JsonValue | null): AutomationActionConfig | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const candidate = value as Record<string, unknown>;
    if (!('type' in candidate) || typeof candidate.type !== 'string') {
      return null;
    }

    if (!Object.values(AutomationActionType).includes(candidate.type as AutomationActionType)) {
      return null;
    }

    return {
      type: candidate.type as AutomationActionType,
      params: (candidate.params as Record<string, unknown> | undefined) ?? undefined,
    };
  }

  private toDomainSeverity(value: $Enums.ModerationSeverity): ModerationSeverity {
    return value as unknown as ModerationSeverity;
  }

  private toDomainStatus(value: $Enums.ModerationCaseStatus): ModerationCaseStatus {
    return value as unknown as ModerationCaseStatus;
  }
}

type CaseSnapshot = {
  id: string;
  status: $Enums.ModerationCaseStatus;
  severity: $Enums.ModerationSeverity;
  reportedUserId: string | null;
};

type RuleConditions = {
  minimumSeverity?: ModerationSeverity;
  statusIn?: ModerationCaseStatus[];
  reportedUserId?: string;
};

type AutomationRuleRecord = Prisma.AutomationRuleGetPayload<{ include: { runs: true } }>;
