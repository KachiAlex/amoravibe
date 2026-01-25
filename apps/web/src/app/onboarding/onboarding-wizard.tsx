'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import type {
  DiscoverySpace,
  Gender,
  MatchPreference,
  OnboardingStatusResponse,
  Orientation,
  VerificationIntent,
} from '@lovedate/api';
import { Badge, Card, PillButton } from '@lovedate/ui';
import {
  type OnboardingSubmissionState,
  onboardingSubmissionInitialState,
  submitOnboardingAction,
} from './actions';

interface OnboardingWizardProps {
  status: OnboardingStatusResponse;
  demoUserId: string;
}

interface DraftState {
  legalName: string;
  legalLastName: string;
  displayName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  password: string;
  gender: Gender;
  orientation: Orientation;
  orientationPreferences: Orientation[];
  discoverySpace: DiscoverySpace;
  matchPreferences: MatchPreference[];
  city: string;
  bio: string;
  photos: string[];
  verificationIntent: VerificationIntent;
}

const STORAGE_KEY = 'lovedate_web_onboarding_draft';

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Woman', value: 'woman' },
  { label: 'Man', value: 'man' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Trans woman', value: 'trans_woman' },
  { label: 'Trans man', value: 'trans_man' },
  { label: 'Self describe', value: 'self_describe' },
];

const ORIENTATION_OPTIONS: { label: string; value: Orientation }[] = [
  { label: 'Heterosexual', value: 'heterosexual' },
  { label: 'Gay', value: 'gay' },
  { label: 'Lesbian', value: 'lesbian' },
  { label: 'Bisexual', value: 'bisexual' },
  { label: 'Pansexual', value: 'pansexual' },
  { label: 'Queer', value: 'queer' },
  { label: 'Asexual', value: 'asexual' },
];

const DISCOVERY_OPTIONS: { label: string; value: DiscoverySpace; description: string }[] = [
  {
    label: 'Straight space',
    value: 'straight',
    description: 'Exclusively heterosexual visibility lanes.',
  },
  { label: 'LGBTQ space', value: 'lgbtq', description: 'Queer-forward spotlights & lanes.' },
  {
    label: 'Dual visibility',
    value: 'both',
    description: 'Reserved for bisexual, pansexual, or queer selections.',
  },
];

const MATCH_OPTIONS: { label: string; value: MatchPreference; description: string }[] = [
  { label: 'Men', value: 'men', description: 'Appear to men-curated spaces.' },
  { label: 'Women', value: 'women', description: 'Appear to women-curated spaces.' },
  { label: 'Everyone', value: 'everyone', description: 'Unified pool (removes other picks).' },
];

const VERIFICATION_OPTIONS: { label: string; value: VerificationIntent; helper: string }[] = [
  {
    label: 'Verify now',
    value: 'verify_now',
    helper: 'Launch Persona immediately and unlock messaging.',
  },
  {
    label: 'Skip for now',
    value: 'skip',
    helper: 'Limited experience until verification is completed.',
  },
];

const STEP_CONFIG = [
  {
    id: 'identity',
    title: 'Identity basics',
    description: 'Legal details, contact information, and password policy.',
  },
  {
    id: 'profile',
    title: 'Discovery profile',
    description: 'Orientation, discovery spaces, and match preferences.',
  },
  {
    id: 'trust',
    title: 'Trust & verification',
    description: 'City context, gallery, and verification intent.',
  },
] as const;

const INITIAL_DRAFT: DraftState = {
  legalName: 'Ifeoluwa',
  legalLastName: 'Adeyemi',
  displayName: 'Ife',
  dateOfBirth: '1994-07-12',
  email: 'ife@example.com',
  phone: '+2348000000000',
  password: 'Lovedate!234',
  gender: 'woman',
  orientation: 'bisexual',
  orientationPreferences: ['bisexual', 'pansexual', 'queer'],
  discoverySpace: 'both',
  matchPreferences: ['men', 'women'],
  city: 'Lagos',
  bio: 'Founder, traveler, and dance floor optimist focused on intentional dating.',
  photos: [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
  ],
  verificationIntent: 'verify_now',
};

export default function OnboardingWizard({ status, demoUserId }: OnboardingWizardProps) {
  const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
  const [stepIndex, setStepIndex] = useState(0);
  const [formState, formAction] = useFormState(
    submitOnboardingAction,
    onboardingSubmissionInitialState
  );
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const cached = window.localStorage.getItem(STORAGE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached) as { payload?: Partial<DraftState> };
      if (parsed.payload) {
        setDraft((prev) => ({ ...prev, ...parsed.payload }));
      }
    } catch (error) {
      console.warn('Unable to restore onboarding draft', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ payload: draft, updatedAt: new Date().toISOString() })
    );
  }, [draft]);

  useEffect(() => {
    if (formState.status === 'success' && typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [formState.status]);

  useEffect(() => {
    if (formState.status !== 'success' || !formState.nextRoute) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.push(formState.nextRoute!);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [formState.status, formState.nextRoute, router]);

  const stepValid = useMemo(() => validateStep(draft, stepIndex), [draft, stepIndex]);

  const goNext = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, STEP_CONFIG.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleContinue = useCallback(() => {
    if (stepValid) {
      goNext();
    }
  }, [goNext, stepValid]);

  const toggleOrientationPreference = (value: Orientation) => {
    setDraft((prev) => {
      const exists = prev.orientationPreferences.includes(value);
      return {
        ...prev,
        orientationPreferences: exists
          ? prev.orientationPreferences.filter((entry) => entry !== value)
          : [...prev.orientationPreferences, value],
      };
    });
  };

  const toggleMatchPreference = (value: MatchPreference) => {
    setDraft((prev) => {
      const exists = prev.matchPreferences.includes(value);
      if (value === 'everyone') {
        return { ...prev, matchPreferences: exists ? [] : ['everyone'] };
      }
      const withoutEveryone = prev.matchPreferences.filter((entry) => entry !== 'everyone');
      return {
        ...prev,
        matchPreferences: exists
          ? withoutEveryone.filter((entry) => entry !== value)
          : [...withoutEveryone, value],
      };
    });
  };

  const updatePhoto = (index: number, value: string) => {
    setDraft((prev) => {
      const next = [...prev.photos];
      next[index] = value;
      return { ...prev, photos: next };
    });
  };

  const addPhoto = () => {
    setDraft((prev) => ({ ...prev, photos: [...prev.photos, ''] }));
  };

  const removePhoto = (index: number) => {
    setDraft((prev) => {
      const next = prev.photos.filter((_, idx) => idx !== index);
      return { ...prev, photos: next.length ? next : [''] };
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr,1.1fr]">
      <Card className="space-y-6 border-ink-900/10 bg-white/80 p-6">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700/70">
            Identity service status
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink-900">Live onboarding timeline</h3>
          <p className="mt-1 text-sm text-ink-700">
            Demo user <span className="font-mono text-xs text-ink-900">{demoUserId}</span> syncs
            directly with the identity service status endpoint.
          </p>
        </header>
        <div className="space-y-4">
          {status.steps.map((step) => (
            <div key={step.id} className="rounded-2xl border border-ink-900/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-700/70">{step.id}</p>
                  <p className="text-lg font-semibold text-ink-900">{step.title}</p>
                </div>
                <Badge tone={badgeTone(step.status)}>{step.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-ink-700">{step.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-rose-500/25 bg-white/95 p-6 shadow-[0_22px_55px_rgba(13,15,26,0.08)]">
        <form action={formAction} className="space-y-6">
          <ProgressHeader currentStep={stepIndex} />

          {STEP_CONFIG.map((config, index) => (
            <section key={config.id} className={stepIndex === index ? 'space-y-4' : 'hidden'}>
              <header>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-500">{`0${index + 1}`}</p>
                <h3 className="mt-1 text-xl font-semibold text-ink-900">{config.title}</h3>
                <p className="text-sm text-ink-700">{config.description}</p>
              </header>
              {index === 0 && <IdentityFields draft={draft} setDraft={setDraft} />}
              {index === 1 && (
                <ProfileFields
                  draft={draft}
                  setDraft={setDraft}
                  onToggleOrientation={toggleOrientationPreference}
                  onToggleMatch={toggleMatchPreference}
                />
              )}
              {index === 2 && (
                <TrustFields
                  draft={draft}
                  setDraft={setDraft}
                  onPhotoChange={updatePhoto}
                  onAddPhoto={addPhoto}
                  onRemovePhoto={removePhoto}
                />
              )}
            </section>
          ))}

          <HiddenInputs draft={draft} />

          <FormStatus state={formState} />

          <WizardControls
            isFirstStep={stepIndex === 0}
            isFinalStep={stepIndex === STEP_CONFIG.length - 1}
            onBack={goBack}
            onContinue={handleContinue}
            stepValid={stepValid}
          />
        </form>
      </Card>
    </div>
  );
}

function badgeTone(status: 'pending' | 'active' | 'complete'): 'primary' | 'secondary' | 'success' {
  if (status === 'complete') return 'success';
  if (status === 'active') return 'primary';
  return 'secondary';
}

const ProgressHeader = ({ currentStep }: { currentStep: number }) => (
  <div className="space-y-2">
    <p className="text-xs uppercase tracking-[0.2em] text-ink-700/70">Wizard progress</p>
    <div className="h-2 w-full rounded-full bg-ink-900/10">
      <div
        className="h-full rounded-full bg-rose-500 transition-all"
        style={{ width: `${((currentStep + 1) / STEP_CONFIG.length) * 100}%` }}
      />
    </div>
    <p className="text-sm text-ink-700">
      Step {currentStep + 1} of {STEP_CONFIG.length}
    </p>
  </div>
);

interface FieldProps {
  draft: DraftState;
  setDraft: Dispatch<SetStateAction<DraftState>>;
}

function IdentityFields({ draft, setDraft }: FieldProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Legal first name"
          name="legalName"
          value={draft.legalName}
          onChange={(value) => setDraft((prev) => ({ ...prev, legalName: value }))}
        />
        <TextField
          label="Legal last name"
          name="legalLastName"
          value={draft.legalLastName}
          onChange={(value) => setDraft((prev) => ({ ...prev, legalLastName: value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Display name"
          name="displayName"
          value={draft.displayName}
          onChange={(value) => setDraft((prev) => ({ ...prev, displayName: value }))}
        />
        <label className="space-y-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/70">
            Date of birth
          </span>
          <input
            type="date"
            name="dateOfBirth"
            value={draft.dateOfBirth}
            onChange={(event) => setDraft((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
            className="w-full rounded-xl border border-ink-900/15 p-3 focus:border-rose-500 focus:outline-none"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Email"
          type="email"
          name="email"
          value={draft.email}
          onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))}
          placeholder="you@example.com"
        />
        <TextField
          label="Phone"
          type="tel"
          name="phone"
          value={draft.phone}
          onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))}
          placeholder="+1 555 123 4567"
        />
      </div>
      <TextField
        label="Password"
        type="password"
        name="password"
        value={draft.password}
        onChange={(value) => setDraft((prev) => ({ ...prev, password: value }))}
        helper="Minimum 8 characters. Stored salted + hashed."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Gender"
          name="gender"
          value={draft.gender}
          onChange={(value) => setDraft((prev) => ({ ...prev, gender: value as Gender }))}
          options={GENDER_OPTIONS}
        />
        <SelectField
          label="Orientation"
          name="orientation"
          value={draft.orientation}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              orientation: value as Orientation,
              orientationPreferences: Array.from(
                new Set([value as Orientation, ...prev.orientationPreferences])
              ),
            }))
          }
          options={ORIENTATION_OPTIONS}
        />
      </div>
    </div>
  );
}

function ProfileFields({
  draft,
  setDraft,
  onToggleOrientation,
  onToggleMatch,
}: FieldProps & {
  onToggleOrientation: (value: Orientation) => void;
  onToggleMatch: (value: MatchPreference) => void;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup label="Orientation preferences">
        <div className="grid gap-3 sm:grid-cols-2">
          {ORIENTATION_OPTIONS.map((option) => (
            <ToggleTile
              key={option.value}
              label={option.label}
              description=""
              checked={draft.orientationPreferences.includes(option.value)}
              onChange={() => onToggleOrientation(option.value)}
              name="orientationPreferences"
              value={option.value}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Discovery space">
        <div className="space-y-3">
          {DISCOVERY_OPTIONS.map((option) => (
            <RadioTile
              key={option.value}
              label={option.label}
              description={option.description}
              name="discoverySpace"
              value={option.value}
              checked={draft.discoverySpace === option.value}
              onChange={() => setDraft((prev) => ({ ...prev, discoverySpace: option.value }))}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Match preferences">
        <div className="grid gap-3 sm:grid-cols-2">
          {MATCH_OPTIONS.map((option) => (
            <ToggleTile
              key={option.value}
              label={option.label}
              description={option.description}
              checked={draft.matchPreferences.includes(option.value)}
              onChange={() => onToggleMatch(option.value)}
              name="matchPreferences"
              value={option.value}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function TrustFields({
  draft,
  setDraft,
  onPhotoChange,
  onAddPhoto,
  onRemovePhoto,
}: FieldProps & {
  onPhotoChange: (index: number, value: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
}) {
  return (
    <div className="space-y-5">
      <TextField
        label="City"
        name="city"
        value={draft.city}
        onChange={(value) => setDraft((prev) => ({ ...prev, city: value }))}
      />
      <label className="space-y-2 text-sm">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/70">
          Bio
        </span>
        <textarea
          name="bio"
          value={draft.bio}
          onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))}
          className="min-h-[120px] w-full rounded-2xl border border-ink-900/15 p-3 text-sm focus:border-rose-500 focus:outline-none"
          placeholder="Tell members about your intent, vibe, and boundaries..."
        />
        <span className="text-xs text-ink-600">Aim for at least 20 characters.</span>
      </label>

      <FieldGroup label="Gallery URLs">
        <div className="space-y-3">
          {draft.photos.map((photo, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="url"
                name="photos"
                value={photo}
                onChange={(event) => onPhotoChange(index, event.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-xl border border-ink-900/15 p-3 text-sm focus:border-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(index)}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500"
              >
                Remove
              </button>
            </div>
          ))}
          <PillButton
            type="button"
            variant="outline"
            onClick={onAddPhoto}
            className="w-full justify-center"
          >
            Add another photo
          </PillButton>
        </div>
      </FieldGroup>

      <FieldGroup label="Verification intent">
        <div className="space-y-3">
          {VERIFICATION_OPTIONS.map((option) => (
            <RadioTile
              key={option.value}
              label={option.label}
              description={option.helper}
              name="verificationIntent"
              value={option.value}
              checked={draft.verificationIntent === option.value}
              onChange={() => setDraft((prev) => ({ ...prev, verificationIntent: option.value }))}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/70">{label}</p>
    {children}
  </div>
);

const HiddenInputs = ({ draft }: { draft: DraftState }) => (
  <div className="hidden" aria-hidden="true">
    <input type="hidden" name="legalName" value={draft.legalName} readOnly />
    <input type="hidden" name="legalLastName" value={draft.legalLastName} readOnly />
    <input type="hidden" name="displayName" value={draft.displayName} readOnly />
    <input type="hidden" name="dateOfBirth" value={draft.dateOfBirth} readOnly />
    <input type="hidden" name="email" value={draft.email} readOnly />
    <input type="hidden" name="phone" value={draft.phone} readOnly />
    <input type="hidden" name="password" value={draft.password} readOnly />
    <input type="hidden" name="gender" value={draft.gender} readOnly />
    <input type="hidden" name="orientation" value={draft.orientation} readOnly />
    {draft.orientationPreferences.map((value, index) => (
      <input
        key={`orientation-${value}-${index}`}
        type="hidden"
        name="orientationPreferences"
        value={value}
        readOnly
      />
    ))}
    <input type="hidden" name="discoverySpace" value={draft.discoverySpace} readOnly />
    {draft.matchPreferences.map((value, index) => (
      <input
        key={`match-${value}-${index}`}
        type="hidden"
        name="matchPreferences"
        value={value}
        readOnly
      />
    ))}
    <input type="hidden" name="city" value={draft.city} readOnly />
    <input type="hidden" name="bio" value={draft.bio} readOnly />
    {draft.photos.map((value, index) => (
      <input key={`photo-${index}`} type="hidden" name="photos" value={value} readOnly />
    ))}
    <input type="hidden" name="verificationIntent" value={draft.verificationIntent} readOnly />
  </div>
);

const TextField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  helper,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helper?: string;
}) => (
  <label className="space-y-2 text-sm">
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/70">
      {label}
    </span>
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-ink-900/15 p-3 focus:border-rose-500 focus:outline-none"
    />
    {helper && <span className="text-xs text-ink-600">{helper}</span>}
  </label>
);

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) => (
  <label className="space-y-2 text-sm">
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/70">
      {label}
    </span>
    <select
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-ink-900/15 p-3 focus:border-rose-500 focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const ToggleTile = ({
  label,
  description,
  checked,
  onChange,
  name,
  value,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
}) => (
  <label
    className={`flex cursor-pointer flex-col rounded-2xl border p-4 text-sm transition ${
      checked
        ? 'border-rose-500 bg-rose-500/5 text-ink-900'
        : 'border-ink-900/15 bg-white text-ink-700'
    }`}
  >
    <input
      type="checkbox"
      className="sr-only"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
    />
    <span className="text-base font-semibold">{label}</span>
    {description && <span className="mt-1 text-xs text-ink-600">{description}</span>}
  </label>
);

const RadioTile = ({
  label,
  description,
  checked,
  onChange,
  name,
  value,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
}) => (
  <label
    className={`flex cursor-pointer flex-col rounded-2xl border p-4 text-sm transition ${
      checked
        ? 'border-rose-500 bg-rose-500/5 text-ink-900'
        : 'border-ink-900/15 bg-white text-ink-700'
    }`}
  >
    <input
      type="radio"
      className="sr-only"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
    />
    <span className="text-base font-semibold">{label}</span>
    <span className="mt-1 text-xs text-ink-600">{description}</span>
  </label>
);

const FormStatus = ({ state }: { state: OnboardingSubmissionState }) => {
  if (!state.message) {
    return null;
  }
  const tone = state.status === 'success' ? 'text-emerald-600' : 'text-rose-600';
  return (
    <p className={`text-sm font-semibold ${tone}`} aria-live="polite">
      {state.message}
      {state.nextRoute && state.status === 'success' && (
        <span className="ml-2 text-xs text-ink-700">
          Next route: <code>{state.nextRoute}</code>
        </span>
      )}
    </p>
  );
};

const WizardControls = ({
  isFirstStep,
  isFinalStep,
  onBack,
  onContinue,
  stepValid,
}: {
  isFirstStep: boolean;
  isFinalStep: boolean;
  onBack: () => void;
  onContinue: () => void;
  stepValid: boolean;
}) => {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PillButton type="button" variant="ghost" disabled={isFirstStep} onClick={onBack}>
        Back
      </PillButton>
      {isFinalStep ? (
        <PillButton type="submit" disabled={pending || !stepValid}>
          {pending ? 'Submitting…' : 'Submit onboarding'}
        </PillButton>
      ) : (
        <PillButton type="button" onClick={onContinue} disabled={!stepValid}>
          Continue
        </PillButton>
      )}
    </div>
  );
};

const MIN_BIO_LENGTH = 20;
const MIN_PHOTOS = 2;

function validateStep(draft: DraftState, index: number): boolean {
  switch (index) {
    case 0:
      return Boolean(
        draft.legalName &&
        draft.displayName &&
        draft.dateOfBirth &&
        draft.password.length >= 8 &&
        (draft.email || draft.phone)
      );
    case 1:
      return draft.orientationPreferences.length > 0 && draft.matchPreferences.length > 0;
    case 2: {
      const filledPhotos = draft.photos.filter((photo) => photo.trim().length > 0);
      return (
        draft.city.length > 0 &&
        draft.bio.trim().length >= MIN_BIO_LENGTH &&
        filledPhotos.length >= MIN_PHOTOS
      );
    }
    default:
      return true;
  }
}
