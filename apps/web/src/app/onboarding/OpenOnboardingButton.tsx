'use client';

import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { useOnboardingModal } from '@/app/providers/OnboardingModalProvider';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function OpenOnboardingButton({ onClick, children, ...props }: Props) {
  const { openModal } = useOnboardingModal();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    openModal();
  };

  return (
    <button type="button" {...props} onClick={handleClick}>
      {children}
    </button>
  );
}
