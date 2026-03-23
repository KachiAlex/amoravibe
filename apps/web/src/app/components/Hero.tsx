'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OpenOnboardingButton } from '@/app/onboarding/OpenOnboardingButton';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useOnboardingModal } from '@/app/providers/OnboardingModalProvider';

const heroStats = [
  { label: 'Active Users', value: '2M+' },
  { label: 'Daily Intros', value: '500K+' },
  { label: 'Cities Online', value: '1,200+' },
];

const collageProfiles = [
  {
    id: 'sofia',
    name: 'Sofia · 26',
    city: 'Barcelona',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    top: '4%',
    left: '6%',
    rotate: '-10deg',
    delay: '0s',
  },
  {
    id: 'noah',
    name: 'Noah · 28',
    city: 'New York',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    top: '11%',
    left: '32%',
    rotate: '6deg',
    delay: '0.15s',
  },
  {
    id: 'adara',
    name: 'Adara · 24',
    city: 'Lagos',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    top: '13%',
    left: '60%',
    rotate: '-4deg',
    delay: '0.3s',
  },
  {
    id: 'hiro',
    name: 'Hiro · 30',
    city: 'Tokyo',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    top: '44%',
    left: '12%',
    rotate: '5deg',
    delay: '0.45s',
  },
  {
    id: 'lina',
    name: 'Lina · 27',
    city: 'Seoul',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    top: '47%',
    left: '38%',
    rotate: '-8deg',
    delay: '0.6s',
  },
  {
    id: 'mateo',
    name: 'Mateo · 29',
    city: 'Buenos Aires',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    top: '50%',
    left: '65%',
    rotate: '7deg',
    delay: '0.75s',
  },
];

export function Hero() {
  useOnboardingModal();

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      {/* Collage background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-950" />
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            {collageProfiles.map((profile) => (
              <div
                key={profile.id}
                className="absolute w-36 sm:w-48 lg:w-64 rounded-3xl bg-white/90 shadow-[0_25px_50px_rgba(15,23,42,0.35)] overflow-hidden backdrop-blur-md border border-white/30"
                style={{
                  top: profile.top,
                  left: profile.left,
                  transform: `rotate(${profile.rotate})`,
                  animation: `floatCard 16s ease-in-out infinite`,
                  animationDelay: profile.delay,
                }}
              >
                <div className="relative h-48 sm:h-60 lg:h-72">
                  <Image 
                    src={profile.image} 
                    alt={profile.name} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 8rem, 16rem"
                    quality={80}
                    priority={false}
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-sm font-semibold text-white">{profile.name}</p>
                    <p className="text-xs text-white/80">{profile.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-slate-950/70" />
      </div>

      <div className="relative z-10 flex min-h-[90vh] items-center">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-24 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white/90">
            <Sparkles className="w-4 h-4" />
            Love stories across every race & identity
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
            A world of faces, one place to{' '}
            <span className="text-transparent bg-gradient-to-r from-rose-300 via-amber-200 to-sky-300 bg-clip-text">
              find your person
            </span>
          </h1>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <OpenOnboardingButton className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400 px-10 py-4 text-lg font-semibold text-white shadow-[0_20px_45px_rgba(244,114,182,0.35)] transition hover:scale-[1.01]">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </OpenOnboardingButton>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 text-left text-white/80 max-w-xl mx-auto">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
        }
      `}</style>
    </section>
  );
}
