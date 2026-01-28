'use client';

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ClipboardList,
  Heart,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import type {
  DiscoverySpace,
  Gender,
  MatchPreference,
  Orientation,
  VerificationIntent,
} from '@lovedate/api';
import { lovedateApi } from '@/lib/api';

const TOTAL_STEPS = 6;

const INTERESTS = [
  'Travel',
  'Fitness',
  'Music',
  'Movies',
  'Cooking',
  'Art',
  'Reading',
  'Gaming',
  'Sports',
  'Photography',
  'Dancing',
  'Yoga',
];

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
  { label: 'Asexual', value: 'asexual' },
  { label: 'Queer', value: 'queer' },
];

const DISCOVERY_OPTIONS: { label: string; value: DiscoverySpace; helper: string }[] = [
  {
    label: 'Straight space',
    value: 'straight',
    helper: 'Strictly heterosexual trust lane.',
  },
  {
    label: 'LGBTQ+ space',
    value: 'lgbtq',
    helper: 'Queer-forward spotlighting.',
  },
  {
    label: 'Dual space',
    value: 'both',
    helper: 'Blend both lanes (bi / pan / queer).',
  },
];

const MATCH_OPTIONS: { label: string; value: MatchPreference; helper: string }[] = [
  { label: 'Women', value: 'women', helper: 'Appear to women-curated spaces.' },
  { label: 'Men', value: 'men', helper: 'Appear to men-curated spaces.' },
  { label: 'Everyone', value: 'everyone', helper: 'Unified pool, overrides others.' },
];

const LOOKING_FOR_OPTIONS = [
  { value: 'Long-term relationship', emoji: '💑' },
  { value: 'Short-term relationship', emoji: '💝' },
  { value: 'Friendship', emoji: '🤝' },
  { value: 'Casual dating', emoji: '☕' },
  { value: 'Not sure yet', emoji: '🤔' },
];

type FormData = {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  password: string;
  gender: Gender | '';
  orientation: Orientation | '';
  orientationPreferences: Orientation[];
  discoverySpace: DiscoverySpace | '';
  matchPreferences: MatchPreference[];
  lookingFor: string;
  interests: string[];
  city: string;
  bio: string;
  photos: string[];
  verificationIntent: VerificationIntent;
};

type UpdateFn = (field: keyof FormData, value: FormData[keyof FormData]) => void;

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  password: '',
  gender: '',
  orientation: '',
  orientationPreferences: [],
  discoverySpace: '',
  matchPreferences: [],
  lookingFor: '',
  interests: [],
  city: '',
  bio: '',
  photos: ['', ''],
  verificationIntent: 'verify_now',
};

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setFormData(INITIAL_FORM);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const updateFormData: UpdateFn = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((entry) => entry !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleOrientationPreference = (value: Orientation) => {
    setFormData((prev) => {
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
    setFormData((prev) => {
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
    setFormData((prev) => {
      const next = [...prev.photos];
      next[index] = value;
      return { ...prev, photos: next };
    });
  };

  const handlePhotoFileUpload = (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updatePhoto(index, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const addPhotoField = () => {
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ''] }));
  };

  const removePhotoField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== index),
    }));
  };

  const stepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return Boolean(
          formData.firstName &&
          formData.lastName &&
          formData.displayName &&
          formData.dateOfBirth &&
          formData.gender &&
          formData.orientation
        );
      case 1:
        return Boolean((formData.email || formData.phone) && formData.password.length >= 8);
      case 2:
        return (
          formData.orientationPreferences.length > 0 &&
          formData.matchPreferences.length > 0 &&
          formData.discoverySpace !== ''
        );
      case 3:
        return Boolean(formData.lookingFor && formData.interests.length >= 3);
      case 4:
        return (
          formData.city.trim().length > 0 &&
          formData.bio.trim().length >= 20 &&
          formData.photos.some((url) => url.trim().length > 0)
        );
      case 5:
        return Boolean(formData.verificationIntent);
      default:
        return true;
    }
  }, [currentStep, formData]);

  const handleContinue = () => {
    if (!stepValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!stepValid || pending) return;
    setPending(true);
    setError(null);
    try {
      const payload = {
        legalName: formData.firstName,
        legalLastName: formData.lastName,
        displayName: formData.displayName || formData.firstName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        gender: formData.gender as Gender,
        orientation: formData.orientation as Orientation,
        orientationPreferences: (formData.orientationPreferences.length
          ? formData.orientationPreferences
          : [formData.orientation]) as Orientation[],
        discoverySpace: (formData.discoverySpace || 'straight') as DiscoverySpace,
        matchPreferences: (formData.matchPreferences.length
          ? formData.matchPreferences
          : ['everyone']) as MatchPreference[],
        city: formData.city,
        bio: formData.bio,
        photos: formData.photos.filter((url) => url.trim().length > 0),
        verificationIntent: formData.verificationIntent,
      };
      const response = await lovedateApi.submitOnboarding(payload);
      setSuccess(`Welcome aboard, ${response.user.displayName}! Redirecting…`);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepIdentity key="step-identity" data={formData} onChange={updateFormData} />;
      case 1:
        return <StepContact key="step-contact" data={formData} onChange={updateFormData} />;
      case 2:
        return (
          <StepDiscovery
            key="step-discovery"
            data={formData}
            onChange={updateFormData}
            onToggleMatchPreference={toggleMatchPreference}
            onToggleOrientationPreference={toggleOrientationPreference}
          />
        );
      case 3:
        return (
          <StepIntent
            key="step-intent"
            data={formData}
            onChange={updateFormData}
            onToggleInterest={toggleInterest}
          />
        );
      case 4:
        return (
          <StepStory
            key="step-story"
            data={formData}
            onChange={updateFormData}
            onPhotoChange={updatePhoto}
            onPhotoFileUpload={handlePhotoFileUpload}
            onAddPhoto={addPhotoField}
            onRemovePhoto={removePhotoField}
          />
        );
      case 5:
        return (
          <StepVerification key="step-verification" data={formData} onChange={updateFormData} />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.45 }}
                className="relative w-full max-w-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={onClose}
                  className="absolute -top-5 -right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition hover:bg-gray-100"
                  aria-label="Close onboarding modal"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 text-center text-white"
                >
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
                      <Heart className="h-7 w-7 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
                      AmoraVibe
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold md:text-4xl">
                    Let’s complete your Trust Center profile
                  </h2>
                  <p className="text-lg text-white/80">
                    Six guided steps • Safeguarded in real-time
                  </p>
                </motion.div>

                <StepProgress currentStep={currentStep} />

                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-white p-6 shadow-2xl md:p-10"
                >
                  <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

                  {error && (
                    <p
                      className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                      aria-live="polite"
                    >
                      {error}
                    </p>
                  )}
                  {success && (
                    <p
                      className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                      aria-live="polite"
                    >
                      {success}
                    </p>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-2 rounded-xl border-2 border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-purple-600 hover:bg-purple-50"
                      >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                      </button>
                    )}
                    {currentStep < TOTAL_STEPS - 1 ? (
                      <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!stepValid || pending}
                        className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!stepValid || pending}
                        className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pending ? 'Submitting…' : 'Create account'}
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </motion.form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

const StepProgress = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-6">
    <div className="mb-2 flex items-center justify-between">
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <div key={index} className="flex flex-1 items-center">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: index <= currentStep ? 'rgb(147 51 234)' : 'rgb(229 231 235)',
              scale: index === currentStep ? 1.15 : 1,
            }}
            className="z-10 flex h-10 w-10 items-center justify-center rounded-full text-white font-bold"
          >
            {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
          </motion.div>
          {index < TOTAL_STEPS - 1 && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor: index < currentStep ? 'rgb(147 51 234)' : 'rgb(229 231 235)',
              }}
              className="mx-2 h-1 flex-1 rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

type StepIdentityProps = {
  data: FormData;
  onChange: UpdateFn;
};

const StepIdentity = ({ data, onChange }: StepIdentityProps) => {
  return (
    <motion.div
      key="identity"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader
        icon={<User className="h-6 w-6" />}
        title="Identity basics"
        helper="Legal data stays encrypted but powers high-signal matching."
      />
      <div className="space-y-5">
        <Field label="Legal first name">
          <input
            type="text"
            value={data.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none"
            placeholder="Ifeoluwa"
          />
        </Field>
        <Field label="Legal last name">
          <input
            type="text"
            value={data.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none"
            placeholder="Adeyemi"
          />
        </Field>
        <Field label="Display name">
          <input
            type="text"
            value={data.displayName}
            onChange={(event) => onChange('displayName', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none"
            placeholder="What should matches call you?"
          />
        </Field>
        <Field label="Date of birth">
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(event) => onChange('dateOfBirth', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none"
          />
        </Field>
        <Field label="Gender">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GENDER_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                label={option.label}
                selected={data.gender === option.value}
                onClick={() => onChange('gender', option.value)}
              />
            ))}
          </div>
        </Field>
        <Field label="Orientation">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ORIENTATION_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                label={option.label}
                selected={data.orientation === option.value}
                onClick={() => onChange('orientation', option.value)}
              />
            ))}
          </div>
        </Field>
      </div>
    </motion.div>
  );
};

type StepContactProps = {
  data: FormData;
  onChange: UpdateFn;
};

const StepContact = ({ data, onChange }: StepContactProps) => {
  return (
    <motion.div
      key="contact"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader
        icon={<Users className="h-6 w-6" />}
        title="Contact & security"
        helper="Use at least one channel so we can keep your account safe."
      />
      <div className="space-y-5">
        <Field label="Email address" icon={<Mail className="h-4 w-4 text-gray-400" />}>
          <input
            type="email"
            value={data.email}
            onChange={(event) => onChange('email', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pl-10 focus:border-purple-500 focus:outline-none"
            placeholder="you@email.com"
          />
        </Field>
        <Field label="Phone number" icon={<PhoneFieldIcon />}>
          <input
            type="tel"
            value={data.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pl-10 focus:border-purple-500 focus:outline-none"
            placeholder="+1 555 123 4567"
          />
        </Field>
        <Field label="Password" icon={<Lock className="h-4 w-4 text-gray-400" />}>
          <input
            type="password"
            value={data.password}
            onChange={(event) => onChange('password', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pl-10 focus:border-purple-500 focus:outline-none"
            placeholder="Min 8 characters"
          />
        </Field>
      </div>
    </motion.div>
  );
};

type StepDiscoveryProps = {
  data: FormData;
  onChange: UpdateFn;
  onToggleOrientationPreference: (value: Orientation) => void;
  onToggleMatchPreference: (value: MatchPreference) => void;
};

const StepDiscovery = ({
  data,
  onChange,
  onToggleMatchPreference,
  onToggleOrientationPreference,
}: StepDiscoveryProps) => {
  return (
    <motion.div
      key="discovery"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader
        icon={<Sparkles className="h-6 w-6" />}
        title="Discovery preferences"
        helper="We tune visibility lanes so the right people find you fast."
      />
      <div className="space-y-5">
        <Field label="Orientation preferences">
          <div className="flex flex-wrap gap-3">
            {ORIENTATION_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                label={option.label}
                selected={data.orientationPreferences.includes(option.value)}
                onClick={() => onToggleOrientationPreference(option.value)}
                multi
              />
            ))}
          </div>
        </Field>
        <Field label="Visibility lanes">
          <div className="flex flex-wrap gap-3">
            {MATCH_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                label={option.label}
                helper={option.helper}
                selected={data.matchPreferences.includes(option.value)}
                onClick={() => onToggleMatchPreference(option.value)}
                multi
              />
            ))}
          </div>
        </Field>
        <Field label="Discovery space">
          <div className="grid gap-4 md:grid-cols-3">
            {DISCOVERY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('discoverySpace', option.value)}
                className={`rounded-2xl border-2 px-4 py-4 text-left transition hover:border-purple-500 ${
                  data.discoverySpace === option.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <p className="text-base font-semibold text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-500">{option.helper}</p>
              </button>
            ))}
          </div>
        </Field>
      </div>
    </motion.div>
  );
};

type StepIntentProps = {
  data: FormData;
  onChange: UpdateFn;
  onToggleInterest: (interest: string) => void;
};

const StepIntent = ({ data, onChange, onToggleInterest }: StepIntentProps) => {
  return (
    <motion.div
      key="intent"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader
        icon={<ClipboardList className="h-6 w-6" />}
        title="What are you looking for?"
        helper="Signals make it easier to pair you with compatible intentions."
      />
      <div className="space-y-5">
        <Field label="Relationship intent">
          <div className="grid gap-3 sm:grid-cols-2">
            {LOOKING_FOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('lookingFor', option.value)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition ${
                  data.lookingFor === option.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-base font-semibold text-gray-900">{option.value}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Your interests (choose at least 3)">
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <ToggleButton
                key={interest}
                label={interest}
                selected={data.interests.includes(interest)}
                onClick={() => onToggleInterest(interest)}
                multi
              />
            ))}
          </div>
        </Field>
      </div>
    </motion.div>
  );
};

type StepStoryProps = {
  data: FormData;
  onChange: UpdateFn;
  onPhotoChange: (index: number, value: string) => void;
  onPhotoFileUpload: (index: number, file: File | null) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
};

const StepStory = ({
  data,
  onChange,
  onPhotoChange,
  onPhotoFileUpload,
  onAddPhoto,
  onRemovePhoto,
}: StepStoryProps) => {
  return (
    <motion.div
      key="story"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader
        icon={<MapPin className="h-6 w-6" />}
        title="Profile story"
        helper="Ground your profile with context, voice, and proof-of-life shots."
      />
      <div className="space-y-5">
        <Field label="City">
          <input
            type="text"
            value={data.city}
            onChange={(event) => onChange('city', event.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none"
            placeholder="Brooklyn, New York"
          />
        </Field>
        <Field label="Bio (min 20 characters)">
          <textarea
            value={data.bio}
            onChange={(event) => onChange('bio', event.target.value)}
            className="h-32 w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 focus:outline-none"
            placeholder="Share your story, quirks, or what lights you up."
          />
        </Field>
        <Field label="Photos">
          <div className="space-y-4">
            {data.photos.map((photo, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center rounded-2xl border-2 border-dashed border-gray-200 px-4 py-3">
                  <Camera className="mr-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={photo}
                    onChange={(event) => onPhotoChange(index, event.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="https://images.lovedate.com/you.jpg"
                  />
                </div>
                <label className="flex w-full max-w-[160px] cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-purple-500 hover:text-purple-600">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => onPhotoFileUpload(index, event.target.files?.[0] ?? null)}
                  />
                </label>
                {data.photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(index)}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:border-rose-400 hover:text-rose-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {data.photos.length < 5 && (
              <button
                type="button"
                onClick={onAddPhoto}
                className="flex items-center gap-2 text-sm font-semibold text-purple-600"
              >
                + Add another link
              </button>
            )}
          </div>
        </Field>
      </div>
    </motion.div>
  );
};

type StepVerificationProps = {
  data: FormData;
  onChange: UpdateFn;
};

const StepVerification = ({ data, onChange }: StepVerificationProps) => {
  return (
    <motion.div
      key="verification"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader
        icon={<ShieldCheck className="h-6 w-6" />}
        title="Verification"
        helper="Opt into live verification now or schedule it for later."
      />
      <Field label="Verification intent">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              value: 'verify_now',
              label: 'Verify now',
              helper: 'Fast-lane into premium visibility.',
            },
            {
              value: 'verify_later',
              label: 'Verify later',
              helper: 'We’ll remind you after onboarding.',
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange('verificationIntent', option.value as VerificationIntent)}
              className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                data.verificationIntent === option.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200'
              }`}
            >
              <p className="text-base font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-500">{option.helper}</p>
            </button>
          ))}
        </div>
      </Field>
      <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-purple-600" />
          Verification unlocks deeper trust signals, feature access, and faster approvals.
        </p>
      </div>
    </motion.div>
  );
};

function SectionHeader({
  icon,
  title,
  helper,
}: {
  icon: ReactNode;
  title: string;
  helper: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{helper}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-900">
      <span className="mb-2 block text-sm text-gray-600">{label}</span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        {children}
      </div>
    </label>
  );
}

function ToggleButton({
  label,
  selected,
  onClick,
  multi,
  helper,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
  helper?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${
        selected
          ? 'border-purple-600 bg-purple-50 text-purple-700'
          : 'border-gray-200 text-gray-700'
      } ${multi ? 'min-w-[140px]' : 'w-full'}`}
    >
      {label}
      {helper && <p className="mt-1 text-xs font-normal text-gray-500">{helper}</p>}
    </button>
  );
}

const PhoneFieldIcon = () => (
  <svg
    className="h-4 w-4 text-gray-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 3h20" />
    <path d="M2 8h20" />
    <path d="M5 3v5" />
    <path d="M19 3v5" />
    <rect x="4" y="11" width="16" height="10" rx="2" />
  </svg>
);
