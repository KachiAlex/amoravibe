'use client';

import { useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { PillButton, Card } from '@lovedate/ui';
import {
  requestAuditExportAction,
  requestAuditPurgeAction,
  privacyActionInitialState,
  type PrivacyActionState,
} from './actions';

interface PrivacyActionsPanelProps {
  userId: string;
}

const statusTone = (state: PrivacyActionState) => {
  if (state.status === 'success') {
    return 'text-emerald-600';
  }
  if (state.status === 'error') {
    return 'text-rose-600';
  }
  return 'text-ink-700';
};

const HelperText = ({ state }: { state: PrivacyActionState }) => {
  if (!state.message) {
    return null;
  }
  return (
    <p className={`text-sm ${statusTone(state)}`} aria-live="polite">
      {state.message}
    </p>
  );
};

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <PillButton type="submit" disabled={pending} className="w-full justify-center">
      {pending ? 'Submitting…' : label}
    </PillButton>
  );
};

export default function PrivacyActionsPanel({ userId }: PrivacyActionsPanelProps) {
  const [exportState, exportAction] = useFormState(
    requestAuditExportAction,
    privacyActionInitialState
  );
  const [purgeState, purgeAction] = useFormState(
    requestAuditPurgeAction,
    privacyActionInitialState
  );
  const safeUserId = useMemo(() => userId.trim(), [userId]);

  return (
    <div className="space-y-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm text-ink-900">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Privacy requests</p>
        <h3 className="mt-2 text-xl font-semibold text-ink-900">Export & deletion tooling</h3>
        <p className="mt-2 text-sm text-ink-700">
          Requests post directly into the identity service audit queue with SLA tracking. A sandbox
          user ID is prefilled for the demo environment.
        </p>
      </div>

      <Card className="space-y-4 border-ink-900/10 bg-white/90 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Data export</p>
          <h4 className="mt-2 text-lg font-semibold">Download your activity log</h4>
          <p className="mt-1 text-sm text-ink-700">
            We send a secure link via email within 48 hours.
          </p>
        </div>
        <form action={exportAction} className="space-y-4">
          <input type="hidden" name="userId" value={safeUserId} />
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/70">
              Notes (optional)
            </span>
            <textarea
              name="notes"
              placeholder="Share any context for this export…"
              className="w-full rounded-xl border border-ink-900/10 bg-transparent p-3 text-sm focus:border-rose-500 focus:outline-none"
              rows={3}
            />
          </label>
          <SubmitButton label="Request export" />
          <HelperText state={exportState} />
        </form>
      </Card>

      <Card className="space-y-4 border-ink-900/10 bg-white/90 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">Delete account</p>
          <h4 className="mt-2 text-lg font-semibold">Start deletion workflow</h4>
          <p className="mt-1 text-sm text-ink-700">
            We enforce cooling-off periods and alert trust agents.
          </p>
        </div>
        <form action={purgeAction} className="space-y-4">
          <input type="hidden" name="userId" value={safeUserId} />
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/70">
              Reason
            </span>
            <textarea
              name="reason"
              defaultValue="User-initiated trust center request"
              className="w-full rounded-xl border border-ink-900/10 bg-transparent p-3 text-sm focus:border-rose-500 focus:outline-none"
              rows={2}
            />
          </label>
          <SubmitButton label="Request deletion" />
          <HelperText state={purgeState} />
        </form>
      </Card>
    </div>
  );
}
