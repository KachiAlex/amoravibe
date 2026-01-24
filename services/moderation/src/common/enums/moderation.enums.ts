export enum ModerationCaseStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  ACTION_TAKEN = 'ACTION_TAKEN',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum ModerationSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ModerationSource {
  USER_REPORT = 'USER_REPORT',
  AUTOMATION = 'AUTOMATION',
  DEVICE_SIGNAL = 'DEVICE_SIGNAL',
  TRUST_TEAM = 'TRUST_TEAM',
}

export enum ReportChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SUPPORT = 'SUPPORT',
}

export enum CaseEventType {
  NOTE = 'NOTE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  ASSIGNMENT = 'ASSIGNMENT',
  ACTION_TAKEN = 'ACTION_TAKEN',
}

export enum AutomationTriggerType {
  REPORT_CREATED = 'REPORT_CREATED',
  CASE_ESCALATED = 'CASE_ESCALATED',
  SCHEDULED = 'SCHEDULED',
}

export enum AutomationActionType {
  ESCALATE_CASE = 'ESCALATE_CASE',
  AUTO_CLOSE_CASE = 'AUTO_CLOSE_CASE',
  ADD_CASE_NOTE = 'ADD_CASE_NOTE',
}
