import * as React from 'react';
import { cn } from '../utils/cn';

export type PillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline';
};

const variantStyles: Record<NonNullable<PillButtonProps['variant']>, string> = {
  solid: 'bg-ink-900 text-sand-100 hover:bg-ink-700',
  outline: 'border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-sand-100',
};

export function PillButton({ variant = 'solid', className, children, ...props }: PillButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
