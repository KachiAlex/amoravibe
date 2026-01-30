'use client';

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

interface LikeActionSubmitButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  pendingLabel?: string;
}

export function LikeActionSubmitButton({
  children,
  className,
  disabled,
  pendingLabel = 'Sending…',
}: LikeActionSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      className={className}
      disabled={isDisabled}
      aria-busy={pending}
      aria-live="polite"
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{pendingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
