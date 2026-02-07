// Stub types for SQLite development mode
// These are not part of the minimal SQLite schema

export enum AuditActorType {
  user = 'user',
  admin = 'admin',
  service = 'service',
  external = 'external',
}

export enum AuditEntityType {
  user = 'user',
  device_fingerprint = 'device_fingerprint',
  verification = 'verification',
  policy_pool_access = 'policy_pool_access',
  risk_signal = 'risk_signal',
  moderation_event = 'moderation_event',
}

export enum AuditAction {
  created = 'created',
  updated = 'updated',
  deleted = 'deleted',
  verified = 'verified',
  access_granted = 'access_granted',
  access_denied = 'access_denied',
}

export enum RiskSignalType {
  device_fingerprint = 'device_fingerprint',
  auth_pattern = 'auth_pattern',
  behavior_anomaly = 'behavior_anomaly',
  content_violation = 'content_violation',
  manual_report = 'manual_report',
}

export enum RiskSignalChannel {
  device_pipeline = 'device_pipeline',
  auth_service = 'auth_service',
  moderation_service = 'moderation_service',
  manual_review = 'manual_review',
  external_feed = 'external_feed',
}

export enum RiskSignalSeverity {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

export enum ModerationSeverity {
  info = 'info',
  warning = 'warning',
  critical = 'critical',
}

export enum AnalyticsPiiTier {
  direct = 'direct',
  hashed = 'hashed',
  aggregate = 'aggregate',
}
