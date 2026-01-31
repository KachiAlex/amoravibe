'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Shield, Lock } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (userId) {
      void router.push(`/dashboard?userId=${encodeURIComponent(userId)}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-600/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Welcome to AmoraVibe
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-lg text-gray-300">
            The dating platform built on trust, safety, and authentic connection.
          </p>

          {/* Key Points */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-6 backdrop-blur-sm">
              <Shield className="mb-3 h-8 w-8 text-purple-400 mx-auto" />
              <h3 className="mb-2 font-semibold text-white">Trust First</h3>
              <p className="text-sm text-gray-400">
                Biometric verification and safety checks protect every member
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-6 backdrop-blur-sm">
              <Heart className="mb-3 h-8 w-8 text-pink-400 mx-auto" />
              <h3 className="mb-2 font-semibold text-white">Authentic</h3>
              <p className="text-sm text-gray-400">
                Real people, real connections, and genuine intentions
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-6 backdrop-blur-sm">
              <Lock className="mb-3 h-8 w-8 text-blue-400 mx-auto" />
              <h3 className="mb-2 font-semibold text-white">Private</h3>
              <p className="text-sm text-gray-400">Your data stays encrypted and in your control</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mb-8 space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
            >
              Continue to Dashboard
            </button>

            <Link
              href="/"
              className="block rounded-lg border border-gray-600 px-8 py-3 font-semibold text-gray-300 transition hover:border-gray-400 hover:text-white"
            >
              Back to Home
            </Link>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
