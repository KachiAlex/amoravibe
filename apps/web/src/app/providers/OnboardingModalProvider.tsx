'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { OnboardingModal } from '@/app/components/OnboardingModal';
import { OnboardingProvider } from '@/lib/onboarding-context';

interface OnboardingModalContextValue {
  openModal: () => void;
  closeModal: () => void;
}

const OnboardingModalContext = createContext<OnboardingModalContextValue | null>(null);

export function OnboardingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <OnboardingProvider>
      <OnboardingModalContext.Provider value={{ openModal, closeModal }}>
        {children}
        <OnboardingModal isOpen={isOpen} onClose={closeModal} />
      </OnboardingModalContext.Provider>
    </OnboardingProvider>
  );
}

export function useOnboardingModal() {
  const context = useContext(OnboardingModalContext);
  if (!context) {
    throw new Error('useOnboardingModal must be used within an OnboardingModalProvider');
  }
  return context;
}
