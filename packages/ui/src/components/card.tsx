import * as React from 'react';
import { cn } from '../utils/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'surface' | 'highlight';
};

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  surface: 'border border-ink-900/10 bg-white/80 shadow-[0_20px_60px_rgba(13,15,26,0.08)]',
  highlight:
    'border border-white/40 bg-white/80 shadow-[0_30px_80px_rgba(13,15,26,0.12)] backdrop-blur',
};

export function Card({ variant = 'surface', className, ...props }: CardProps) {
  return <div className={cn('rounded-[32px] p-8', variantStyles[variant], className)} {...props} />;
}
