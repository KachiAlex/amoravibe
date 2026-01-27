'use server';

import { lovedateApi } from '@/lib/api';
import { getSession } from '@/lib/session';

export type ReverifyActionStatus = 'idle' | 'success' | 'error';

export interface ReverifyActionState {
  status: ReverifyActionStatus;
  message: string | null;
}

export const reverifyActionInitialState: ReverifyActionState = {
  status: 'idle',
  message: null,
};

const successMessage = 'Verification restarted. Check your email for the provider link.';
const defaultErrorMessage = 'Unable to restart verification right now. Try again shortly.';

export async function requestReverificationAction(
  _prevState: ReverifyActionState,
  formData: FormData
): Promise<ReverifyActionState> {
  const session = getSession();
  const formUserId = formData.get('userId')?.toString().trim();
  const userId = formUserId && formUserId.length > 0 ? formUserId : session?.userId;

  if (!userId) {
    return { status: 'error', message: 'Missing user context for verification.' };
  }

  try {
    await lovedateApi.requestReverification({ userId });
    return { status: 'success', message: successMessage };
  } catch (error) {
    console.error('Failed to initiate reverification', error);
    return { status: 'error', message: defaultErrorMessage };
  }
}
