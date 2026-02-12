'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { SignInModal } from '@/app/components/SignInModal';

interface SignInModalContextValue {
  openModal: () => void;
  closeModal: () => void;
}

const SignInModalContext = createContext<SignInModalContextValue | null>(null);

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <SignInModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <SignInModal isOpen={isOpen} onClose={closeModal} />
    </SignInModalContext.Provider>
  );
}

export function useSignInModal() {
  const context = useContext(SignInModalContext);
  if (!context) {
    throw new Error('useSignInModal must be used within a SignInModalProvider');
  }
  return context;
}
