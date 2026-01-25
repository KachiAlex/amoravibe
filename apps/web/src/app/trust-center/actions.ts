'use server';

import { lovedateApi } from '@/lib/api';

export type PrivacyActionStatus = 'idle' | 'success' | 'error';

export interface PrivacyActionState {
  status: PrivacyActionStatus;
  message: string | null;
}

const successExportMessage = 'Export request received. Expect a download link within 48 hours.';
const successPurgeMessage = 'Deletion review queued. Our team will follow up shortly.';

const defaultErrorMessage = 'Something went wrong while submitting your request. Please try again.';

const defaultState: PrivacyActionState = { status: 'idle', message: null };

const channelPayload = {
  channel: 'web_trust_center',
};

const parseUserId = (formData: FormData): string | null => {
  const raw = formData.get('userId');
  if (!raw) {
    return null;
  }
  const value = raw.toString().trim();
  return value.length > 0 ? value : null;
};

export async function requestAuditExportAction(
  _prevState: PrivacyActionState,
  formData: FormData
): Promise<PrivacyActionState> {
  const userId = parseUserId(formData);
  if (!userId) {
    return { status: 'error', message: 'Missing user identifier for export request.' };
  }

  const notes = formData.get('notes')?.toString().trim();

  try {
    await lovedateApi.requestAuditExport({
      userId,
      payload: {
        extra: {
          ...channelPayload,
          ...(notes ? { notes } : {}),
        },
      },
    });
    return { status: 'success', message: successExportMessage };
  } catch (error) {
    console.error('Failed to request audit export', error);
    return { status: 'error', message: defaultErrorMessage };
  }
}

export async function requestAuditPurgeAction(
  _prevState: PrivacyActionState,
  formData: FormData
): Promise<PrivacyActionState> {
  const userId = parseUserId(formData);
  if (!userId) {
    return { status: 'error', message: 'Missing user identifier for deletion request.' };
  }

  const reason = formData.get('reason')?.toString().trim() || 'self_service_request';

  try {
    await lovedateApi.requestAuditPurge({
      userId,
      reason,
    });
    return { status: 'success', message: successPurgeMessage };
  } catch (error) {
    console.error('Failed to request audit purge', error);
    return { status: 'error', message: defaultErrorMessage };
  }
}

export const privacyActionInitialState = defaultState;
