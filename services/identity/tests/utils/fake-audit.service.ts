export class FakeAuditService {
  public deviceLogs: Array<{
    userId: string;
    message: string;
    severity: string;
    deviceFingerprintId?: string;
  }> = [];

  async logDeviceAlert(
    userId: string,
    alert: string,
    severity: string,
    deviceFingerprintId?: string
  ) {
    this.deviceLogs.push({ userId, message: alert, severity, deviceFingerprintId });
  }
}
