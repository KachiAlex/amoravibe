export type KycProviderStatus = 'approved' | 'rejected' | 'pending';

export interface KycCallbackPayload {
  verificationId: string;
  provider: string;
  status: KycProviderStatus;
  reference?: string;
  metadata?: Record<string, unknown>;
}
