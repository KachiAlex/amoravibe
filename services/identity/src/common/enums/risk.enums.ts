export enum RiskSignalType {
  DEVICE_FINGERPRINT = 'device_fingerprint',
  AUTH_PATTERN = 'auth_pattern',
  BEHAVIOR_ANOMALY = 'behavior_anomaly',
  CONTENT_VIOLATION = 'content_violation',
  MANUAL_REPORT = 'manual_report',
}

export enum RiskSignalChannel {
  DEVICE_PIPELINE = 'device_pipeline',
  AUTH_SERVICE = 'auth_service',
  MODERATION_SERVICE = 'moderation_service',
  MANUAL_REVIEW = 'manual_review',
  EXTERNAL_FEED = 'external_feed',
}

export enum RiskSignalSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
