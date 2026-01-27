'use server';

import type {
  DiscoverySpace,
  Gender,
  MatchPreference,
  OnboardingStatusResponse,
  OnboardingSubmissionPayload,
  Orientation,
  VerificationIntent,
} from '@lovedate/api';
import { lovedateApi } from '@/lib/api';
import { setSession } from '@/lib/session';

export type OnboardingSubmissionStatus = 'idle' | 'success' | 'error';

export interface OnboardingSubmissionState {
  status: OnboardingSubmissionStatus;
  message: string | null;
  nextRoute?: string | null;
  userId?: string | null;
}

const successMessage = 'Onboarding complete. Redirecting you to your dashboard.';
const defaultErrorMessage =
  'Unable to submit onboarding details. Please review the form and try again.';

const defaultState: OnboardingSubmissionState = {
  status: 'idle',
  message: null,
  nextRoute: null,
  userId: null,
};

const GENDERS: readonly Gender[] = [
  'man',
  'woman',
  'non_binary',
  'trans_man',
  'trans_woman',
  'self_describe',
];
const ORIENTATIONS: readonly Orientation[] = [
  'heterosexual',
  'gay',
  'lesbian',
  'bisexual',
  'pansexual',
  'asexual',
  'queer',
];
const DISCOVERY_SPACES: readonly DiscoverySpace[] = ['straight', 'lgbtq', 'both'];
const MATCH_PREFERENCES: readonly MatchPreference[] = ['men', 'women', 'everyone'];
const VERIFICATION_INTENTS: readonly VerificationIntent[] = ['verify_now', 'skip'];

export const onboardingSubmissionInitialState = defaultState;

export async function fetchOnboardingStatusAction(
  userId: string
): Promise<OnboardingStatusResponse | null> {
  if (!userId) {
    return null;
  }

  try {
    return await lovedateApi.fetchOnboardingStatus(userId);
  } catch (error) {
    console.error('Failed to fetch onboarding status', error);
    return null;
  }
}

export async function submitOnboardingAction(
  _prevState: OnboardingSubmissionState,
  formData: FormData
): Promise<OnboardingSubmissionState> {
  try {
    const payload = mapFormDataToPayload(formData);
    const response = await lovedateApi.submitOnboarding(payload);
    setSession({ userId: response.user.id });

    return {
      status: 'success',
      message: successMessage,
      nextRoute: response.nextRoute,
      userId: response.user.id,
    };
  } catch (error) {
    console.error('Failed to submit onboarding form', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : defaultErrorMessage,
      nextRoute: null,
      userId: null,
    };
  }
}

function mapFormDataToPayload(formData: FormData): OnboardingSubmissionPayload {
  const legalName = getRequiredString(formData, 'legalName');
  const legalLastName = getOptionalString(formData, 'legalLastName');
  const displayName = getRequiredString(formData, 'displayName');
  const dateOfBirth = getRequiredString(formData, 'dateOfBirth');
  const email = getOptionalString(formData, 'email');
  const phone = getOptionalString(formData, 'phone');
  const password = getRequiredString(formData, 'password');
  const gender = parseEnum(formData, 'gender', GENDERS);
  const orientation = parseEnum(formData, 'orientation', ORIENTATIONS);
  const orientationPreferences = parseEnumArray(
    collectValues(formData, 'orientationPreferences'),
    ORIENTATIONS,
    'orientation preference'
  );
  const discoverySpace = parseEnum(formData, 'discoverySpace', DISCOVERY_SPACES);
  const matchPreferences = parseEnumArray(
    collectValues(formData, 'matchPreferences'),
    MATCH_PREFERENCES,
    'match preference'
  );
  const city = getRequiredString(formData, 'city');
  const bio = getOptionalString(formData, 'bio');
  const photos = collectValues(formData, 'photos');
  const verificationIntent = parseEnum(formData, 'verificationIntent', VERIFICATION_INTENTS);

  if (orientationPreferences.length === 0) {
    throw new Error('Select at least one orientation preference.');
  }

  if (matchPreferences.length === 0) {
    throw new Error('Select at least one match preference.');
  }

  if (photos.length === 0) {
    throw new Error('Add at least one profile photo.');
  }

  return {
    legalName,
    legalLastName: legalLastName ?? undefined,
    displayName,
    dateOfBirth,
    email: email ?? undefined,
    phone: phone ?? undefined,
    password,
    gender,
    orientation,
    orientationPreferences,
    discoverySpace,
    matchPreferences,
    city,
    bio: bio ?? undefined,
    photos,
    verificationIntent,
  };
}

function getRequiredString(formData: FormData, field: string): string {
  const value = formData.get(field)?.toString().trim();
  if (!value) {
    throw new Error(`Missing required field: ${field}.`);
  }
  return value;
}

function getOptionalString(formData: FormData, field: string): string | null {
  const value = formData.get(field)?.toString().trim();
  return value && value.length > 0 ? value : null;
}

function collectValues(formData: FormData, field: string): string[] {
  const entries = formData.getAll(field);
  if (entries.length === 0) {
    return [];
  }

  return entries
    .flatMap((entry) =>
      entry
        .toString()
        .split(/\r?\n|,/)
        .map((token) => token.trim())
        .filter(Boolean)
    )
    .filter(Boolean);
}

function parseEnum<T extends string>(formData: FormData, field: string, allowed: readonly T[]): T {
  const value = getRequiredString(formData, field);
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid value for ${field}.`);
  }
  return value as T;
}

function parseEnumArray<T extends string>(
  values: string[],
  allowed: readonly T[],
  label: string
): T[] {
  return values.map((value) => {
    if (!allowed.includes(value as T)) {
      throw new Error(`Invalid ${label} selection: ${value}.`);
    }
    return value as T;
  });
}
