'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
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

    try {
      const payload = {
        email: form.mode === 'email' ? form.email.trim() : undefined,
        phone: form.mode === 'phone' ? form.phone.trim() : undefined,
        password: form.password,
      };

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          (await response.json().catch(() => null))?.message ?? 'Invalid credentials.'
        );
      }

      const result = await response.json();
      setSuccess(`Welcome back, ${result.user.displayName}! Redirecting…`);
      setTimeout(() => {
        setSuccess(null);
        onClose();
        router.push(result.nextRoute ?? '/dashboard');
      }, 1100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign you in.');
    } finally {
      setPending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/80 backdrop-blur"
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

                <div className="rounded-3xl bg-white p-8 shadow-2xl">
                  <div className="mb-6 text-center">
                    <p className="text-xs uppercase tracking-[0.4em] text-ink-500">Lovedate</p>
                    <h2 className="mt-3 font-display text-3xl text-ink-900">Sign in to continue</h2>
                    <p className="mt-2 text-sm text-ink-600">
                      Secure access to your trust dashboard.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex rounded-full bg-ink-50 p-1">
                      {(['email', 'phone'] as SignInMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleModeChange(mode)}
                          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                            form.mode === mode ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
                          }`}
                        >
                          {mode === 'email' ? 'Email' : 'Phone'}
                        </button>
                      ))}
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink-700">{identifierLabel}</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 focus-within:border-ink-900">
                        <IdentifierIcon className="h-4 w-4 text-ink-400" />
                        <input
                          type={form.mode === 'email' ? 'email' : 'tel'}
                          autoComplete={form.mode === 'email' ? 'email' : 'tel'}
                          value={identifierValue}
                          onChange={(event) => handleChange(form.mode, event.currentTarget.value)}
                          className="w-full bg-transparent text-ink-900 outline-none"
                          placeholder={
                            form.mode === 'email' ? 'you@example.com' : '+1 (415) 555-0101'
                          }
                        />
                      </div>
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink-700">Password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 focus-within:border-ink-900">
                        <Lock className="h-4 w-4 text-ink-400" />
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={form.password}
                          onChange={(event) => handleChange('password', event.currentTarget.value)}
                          className="w-full bg-transparent text-ink-900 outline-none"
                          placeholder="At least 8 characters"
                        />
                      </div>
                    </label>

                    {error && (
                      <p
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                        aria-live="polite"
                      >
                        {error}
                      </p>
                    )}

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

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={async () => {
                          // Try to use Netlify Identity widget if present, otherwise fall back to dev helper
                          const netlify = (window as any).netlifyIdentity;
                          if (netlify && typeof netlify.open === 'function') {
                            netlify.open();
                            netlify.on('login', async (user: any) => {
                              try {
                                const token = user?.token?.access_token || user?.token?.id_token || null;
                                // exchange with our backend to get lovedate session/jwt
                                const resp = await fetch('/api/auth/netlify', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id_token: token }),
                                });
                                if (resp.ok) {
                                  const body = await resp.json();
                                  setSuccess(`Welcome back, ${body.user.displayName}! Redirecting…`);
                                  setTimeout(() => {
                                    onClose();
                                    window.location.href = body.nextRoute || '/dashboard';
                                  }, 900);
                                }
                              } catch (err) {
                                setError('Netlify Identity signin failed');
                              }
                            });
                          } else {
                            // Dev fallback: call our auth endpoint with provided email (only works locally)
                            try {
                              const email = form.email.trim() || prompt('Enter email for dev Netlify login (e.g. admin@amoravibe.com)') || '';
                              const resp = await fetch('/api/auth/netlify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email }),
                              });
                              if (!resp.ok) throw new Error('Auth failed');
                              const body = await resp.json();
                              setSuccess(`Welcome back, ${body.user.displayName}! Redirecting…`);
                              setTimeout(() => {
                                onClose();
                                window.location.href = body.nextRoute || '/dashboard';
                              }, 900);
                            } catch (err) {
                              setError('Netlify Identity (dev) signin failed');
                            }
                          }
                        }}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white py-3 text-sm text-ink-700 shadow-sm hover:shadow-md"
                      >
                        Sign in with Netlify Identity
                      </button>
                    </div>
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
