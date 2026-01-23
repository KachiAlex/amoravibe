import { GenerateKycUploadDto, KycUploadPurpose } from '../dto/generate-kyc-upload.dto';
import { KycCallbackPayload } from '../dto/kyc-callback-payload';

export interface ProviderVerificationCreate {
  userId: string;
  verificationId: string;
}

export interface ProviderVerificationDecision extends KycCallbackPayload {}

export interface ProviderUploadRequest extends GenerateKycUploadDto {}

export interface ProviderUploadResponse {
  url: string;
  method?: 'PUT' | 'POST';
  headers?: Record<string, string>;
  fields?: Record<string, string>;
  key: string;
  bucket: string;
  purpose: KycUploadPurpose;
  expiresAt: string;
}

export interface ProviderWebhookContext {
  signature?: string;
  timestamp?: string;
}

export interface ProviderVerificationCreateResult {
  providerReference?: string;
}

export interface KycProvider {
  createVerification(input: ProviderVerificationCreate): Promise<ProviderVerificationCreateResult>;
  getUploadTarget(dto: ProviderUploadRequest): Promise<ProviderUploadResponse>;
  parseWebhook(
    payload: unknown,
    context?: ProviderWebhookContext
  ): Promise<ProviderVerificationDecision>;
}
