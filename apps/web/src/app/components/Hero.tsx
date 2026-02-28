'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OpenOnboardingButton } from '@/app/onboarding/OpenOnboardingButton';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useOnboardingModal } from '@/app/providers/OnboardingModalProvider';

const heroStats = [
  { label: 'Active Users', value: '2M+' },
  { label: 'Matches Daily', value: '500K+' },
  { label: 'Success Rate', value: '95%' },
];

export function Hero() {
  useOnboardingModal();

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(255,192,203,0.35),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(147,112,219,0.25),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8f4ff_60%,#f5f5f5_100%)] pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Soft Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-pink-200/35 blur-[120px] animate-blob" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-purple-200/30 blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/25 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Over 2M+ Happy Couples</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Your{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Perfect Match
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Connect with genuine people who share your interests, values, and dreams. Start your
              journey to meaningful relationships today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <a
                role="button"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-medium transition-all inline-flex items-center justify-center gap-2"
              >
                <OpenOnboardingButton className="inline-flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </OpenOnboardingButton>
              </a>
              <Link
                href="#how-it-works"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-900 px-8 py-3 rounded-full font-medium transition-all inline-flex items-center justify-center"
              >
                Watch Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Main large image */}
              <div className="col-span-2 rounded-2xl overflow-hidden shadow-2xl relative group">
                <Image
                  src="https://images.unsplash.com/photo-1765292784481-3f791575ce9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGNvdXBsZSUyMHJvbWFudGljJTIwbG92ZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTU2NjMzNnww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Happy couple"
                  width={600}
                  height={320}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Floating card decorations */}
              <div
                className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl"
                style={{ animation: 'float 3s ease-in-out infinite' }}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                  <div>
                    <div className="font-bold text-gray-900">It&apos;s a Match!</div>
                    <div className="text-xs text-gray-600">Sarah & John</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl"
                style={{ animation: 'float 3s ease-in-out infinite 1s' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    98%
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Perfect Match</div>
                    <div className="text-xs text-gray-600">Compatibility</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}
