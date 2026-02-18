import * as React from 'react';
import { cn } from '../utils/cn';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'primary' | 'neutral';
};

const toneStyles: Record<NonNullable<BadgeProps['tone']>, string> = {
  primary: 'bg-rose-500/15 text-rose-500 border border-rose-500/40',
  neutral: 'bg-ink-900/5 text-ink-700 border border-ink-900/10',
};

export function Badge({ tone = 'primary', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
