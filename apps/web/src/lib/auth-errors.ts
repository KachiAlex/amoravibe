export type AuthErrorCode =
  | 'AccountNotFound'
  | 'InvalidPassword'
  | 'MissingCredentials'
  | 'Unauthorized'
  | 'CredentialsSignin'
  | 'AccessDenied'
  | 'Configuration'
  | 'Verification';

const AUTH_ERROR_MAP: Record<string, { title: string; description: string }> = {
  AccountNotFound: {
    title: 'Account not found',
    description: 'We couldn’t find an account with those details. Double-check your email/phone or sign up first.',
  },
  InvalidPassword: {
    title: 'Incorrect password',
    description: 'That password doesn’t match our records. Try again or reset it if you forgot.',
  },
  MissingCredentials: {
    title: 'Missing information',
    description: 'Enter both your email/phone and password before trying again.',
  },
  Unauthorized: {
    title: 'Access denied',
    description: 'You’re not allowed to access this resource. Sign in with an authorized account.',
  },
  CredentialsSignin: {
    title: 'Sign-in failed',
    description: 'We couldn’t verify those credentials. Please try again.',
  },
  AccessDenied: {
    title: 'Access denied',
    description: 'Permission was denied for this request. Try another account.',
  },
  Configuration: {
    title: 'Configuration issue',
    description: 'Our auth setup looks misconfigured right now. Please try again soon.',
  },
  Verification: {
    title: 'Verification needed',
    description: 'Check your inbox for a verification link before signing in.',
  },
};

const DEFAULT_ERROR = {
  title: 'Unable to sign you in',
  description: 'Something went wrong while signing you in. Please try again.',
};

export function getAuthErrorMessage(error?: string | null) {
  if (!error) return DEFAULT_ERROR;
  return AUTH_ERROR_MAP[error] ?? DEFAULT_ERROR;
}
