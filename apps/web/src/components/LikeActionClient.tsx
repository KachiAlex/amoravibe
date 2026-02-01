'use client';

import React, { useState } from 'react';
import { lovedateApi } from '../lib/api';

export default function LikeActionClient({
  senderId,
  receiverId,
  action = 'like',
  highlight,
  className,
  children,
  disabled,
  pendingLabel,
  telemetry,
}: {
  senderId?: string | null;
  receiverId?: string;
  action?: string;
  highlight?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  pendingLabel?: string;
  telemetry?: { action: string; cardUserId?: string; filter?: string; surface?: string };
}) {
  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState(false);

  if (!senderId || !receiverId) {
    return (
      <button type="button" className={className} disabled>
        {children}
      </button>
    );
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy || disabled) return;
    setBusy(true);
    setOptimistic(true);

    try {
      // Fire-and-forget telemetry impression and event
      if (telemetry) {
        fetch('/api/telemetry/impression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: senderId,
            impressions: [{ itemId: receiverId, visibleMs: 200 }],
          }),
        }).catch(() => {});

        fetch('/api/telemetry/impression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: senderId, event: telemetry }),
        }).catch(() => {});
      }

      const res = await lovedateApi.likeUser({ senderId, receiverId, action, highlight });
      if (!res || res.success === false) {
        // rollback optimistic
        setOptimistic(false);
      }
    } catch (err) {
      // rollback on error
      setOptimistic(false);
    } finally {
      setBusy(false);
    }
  };

  const label = busy ? (pendingLabel ?? 'Sending…') : optimistic ? '✓' : undefined;

  return (
    <button type="button" onClick={handleClick} className={className} disabled={disabled || busy}>
      {label ? <span>{label}</span> : children}
    </button>
  );
}
