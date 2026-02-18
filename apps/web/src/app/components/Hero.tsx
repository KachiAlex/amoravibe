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
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
          style={{ animationDelay: '4s' }}
        ></div>
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
