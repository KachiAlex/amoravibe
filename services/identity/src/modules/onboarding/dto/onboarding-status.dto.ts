export type OnboardingStepStatus = 'pending' | 'active' | 'complete';

export interface OnboardingStepDto {
  id: string;
  title: string;
  description: string;
  status: OnboardingStepStatus;
}

export interface OnboardingStatusDto {
  userId: string;
  progressPercent: number;
  steps: OnboardingStepDto[];
}
