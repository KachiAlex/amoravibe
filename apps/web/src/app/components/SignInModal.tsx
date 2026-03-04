'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { AnimatePresence, motion } from '@/lib/motion-shim';
import { CheckCircle2, Loader2, Lock, Mail, Phone, X } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SignInMode = 'email' | 'phone';

interface SignInState {
  email: string;
  phone: string;
  password: string;
  mode: SignInMode;
}

const INITIAL_STATE: SignInState = {
  email: '',
  phone: '',
  password: '',
  mode: 'email',
};

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [form, setForm] = useState<SignInState>(INITIAL_STATE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_STATE);
      setPending(false);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const IdentifierIcon = form.mode === 'email' ? Mail : Phone;
  const identifierLabel = useMemo(
    () => (form.mode === 'email' ? 'Email address' : 'Phone number'),
    [form.mode]
  );

  const identifierValue = form.mode === 'email' ? form.email : form.phone;

  const canSubmit = identifierValue.trim().length > 3 && form.password.length >= 8 && !pending;

  const handleChange = (field: keyof SignInState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleModeChange = (mode: SignInMode) => {
    setForm((prev) => ({ ...prev, mode }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError(null);
    setShowToast(false);

    try {
      if (form.mode === 'email') {
        // Sign in with email/password
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Sign in failed');
          setShowToast(true);
          return;
        }

        setSuccess('Welcome back! Redirecting…');
        router.push('/dashboard');
      } else {
        // Phone mode not supported with JWT auth
        setError('Phone sign-in is not currently supported');
        setShowToast(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setShowToast(true);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [success, onClose]);

  return (
    <AnimatePresence>
      {showToast && error && (
        <div className="fixed top-6 left-1/2 z-[9999] -translate-x-1/2 rounded-lg bg-rose-600 px-6 py-3 text-white shadow-lg animate-fade-in">
          {error}
        </div>
      )}
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 py-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative w-full max-w-md"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute -top-4 -right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-ink-50"
                  aria-label="Close sign-in modal"
                >
                  <X className="h-5 w-5 text-ink-700" />
                </button>

                <div className="rounded-3xl bg-white p-8 shadow-2xl border border-gray-100">
                  <div className="mb-6 text-center">
                    <p className="text-xs uppercase tracking-[0.4em] text-ink-600">Lovedate</p>
                    <h2 className="mt-3 font-display text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Sign in to continue
                    </h2>
                    <p className="mt-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">
                      Secure access to your trust dashboard.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex rounded-full bg-gray-100 p-1 border border-gray-200">
                      {(['email', 'phone'] as SignInMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleModeChange(mode)}
                          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
                            form.mode === mode ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-900'
                          }`}
                        >
                          {mode === 'email' ? 'Email' : 'Phone'}
                        </button>
                      ))}
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm font-bold text-ink-900">{identifierLabel}</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 focus-within:border-ink-900 shadow-sm">
                        <IdentifierIcon className="h-4 w-4 text-ink-500" />
                        <input
                          type={form.mode === 'email' ? 'email' : 'tel'}
                          autoComplete={form.mode === 'email' ? 'email' : 'tel'}
                          value={identifierValue}
                          onChange={(event) => handleChange(form.mode, event.currentTarget.value)}
                          className="w-full bg-transparent text-ink-900 placeholder:text-ink-400 outline-none"
                          placeholder={
                            form.mode === 'email' ? 'you@example.com' : '+1 (415) 555-0101'
                          }
                        />
                      </div>
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-bold text-ink-900">Password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 focus-within:border-ink-900 shadow-sm">
                        <Lock className="h-4 w-4 text-ink-500" />
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={form.password}
                          onChange={(event) => handleChange('password', event.currentTarget.value)}
                          className="w-full bg-transparent text-ink-900 placeholder:text-ink-400 outline-none"
                          placeholder="At least 8 characters"
                        />
                      </div>
                    </label>

                    {/* Error toast handled globally */}

                    {success && (
                      <p
                        className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                        aria-live="polite"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {success}
                      </p>
                    )}

                    <button
                      data-testid="sign-in-submit"
                      type="submit"
                      disabled={!canSubmit}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </button>

                    {/* Netlify Identity sign-in removed */}
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
