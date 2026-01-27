'use client';

import { useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { VerificationStatus } from '@lovedate/api';
import { PillButton } from '@lovedate/ui';
import {
  reverifyActionInitialState,
  requestReverificationAction,
  type ReverifyActionState,
} from './actions';

interface ReverifyPanelProps {
  userId: string;
  verificationStatus: VerificationStatus | null;
  providerLabel?: string | null;
  updatedAt?: string | null;
}

const statusCopy: Record<VerificationStatus, { tone: string; note: string }> = {
  unverified: {
    tone: 'text-rose-500',
    note: 'You have not completed identity verification yet.',
  },
  pending: {
    tone: 'text-amber-600',
    note: 'A verification is already in progress.',
  },
  verified: {
    tone: 'text-emerald-600',
    note: 'You are fully verified. No action needed.',
  },
  flagged: {
    tone: 'text-rose-600',
    note: 'Your last verification attempt was flagged. Re-run it to regain access.',
  },
};

const SubmitButton = ({ disabled }: { disabled: boolean }) => {
  const { pending } = useFormStatus();
  return (
    <PillButton type="submit" className="w-full justify-center" disabled={disabled || pending}>
      {pending ? 'Re-requesting…' : 'Restart verification'}
    </PillButton>
  );
};

const HelperText = ({ state }: { state: ReverifyActionState }) => {
  if (!state.message) {
    return null;
  }
  const tone = state.status === 'success' ? 'text-emerald-600' : 'text-rose-600';
  return (
    <p className={`text-sm ${tone}`} aria-live="polite">
      {state.message}
    </p>
  );
};

export default function ReverifyPanel({
  userId,
  verificationStatus,
  providerLabel,
  updatedAt,
}: ReverifyPanelProps) {
  const [state, action] = useFormState(requestReverificationAction, reverifyActionInitialState);
  const statusKey: VerificationStatus = verificationStatus ?? 'unverified';
  const statusMeta = statusCopy[statusKey];
  const disabled = statusKey === 'pending' || statusKey === 'verified';
  const timestamp = useMemo(
    () => (updatedAt ? new Date(updatedAt).toLocaleString() : null),
    [updatedAt]
  );

  return (
    <div className="space-y-4 rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white">
      <div>
        <p className={`text-xs uppercase tracking-[0.35em] ${statusMeta.tone}`}>
          Verification status
        </p>
        <p className="mt-1 text-xl font-semibold text-white">{statusKey}</p>
        <p className="mt-1 text-white/80">{statusMeta.note}</p>
        {providerLabel && <p className="text-xs text-white/70">Provider: {providerLabel}</p>}
        {timestamp && <p className="text-xs text-white/70">Last update: {timestamp}</p>}
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="userId" value={userId} readOnly />
        <SubmitButton disabled={disabled} />
        <HelperText state={state} />
      </form>
    </div>
  );
}
