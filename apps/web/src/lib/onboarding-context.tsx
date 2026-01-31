'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OnboardingData {
  userId: string;
  displayName: string;
  email?: string;
  gender?: string;
  orientation?: string;
  city?: string;
  bio?: string;
  photos?: string[];
  completedAt: number;
}

interface OnboardingContextType {
  data: OnboardingData | null;
  saveOnboarding: (data: OnboardingData) => void;
  clearOnboarding: () => void;
  isOnboarded: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lovedate_onboarding');
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingData;
        setData(parsed);
        setIsOnboarded(true);
      }
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
    }
  }, []);

  const saveOnboarding = (onboardingData: OnboardingData) => {
    try {
      localStorage.setItem('lovedate_onboarding', JSON.stringify(onboardingData));
      setData(onboardingData);
      setIsOnboarded(true);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  };

  const clearOnboarding = () => {
    try {
      localStorage.removeItem('lovedate_onboarding');
      setData(null);
      setIsOnboarded(false);
    } catch (error) {
      console.error('Failed to clear onboarding data:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{ data, saveOnboarding, clearOnboarding, isOnboarded }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
