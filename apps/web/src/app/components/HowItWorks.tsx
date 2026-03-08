'use client';

import { UserPlus, Search, MessageSquare, Heart } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    description:
      "Sign up in minutes and tell us about yourself, your interests, and what you're looking for.",
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '02',
    icon: Search,
    title: 'Discover Matches',
    description: 'Browse through compatible profiles curated by our smart matching algorithm.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Start Connecting',
    description: 'Send a like or message to someone who catches your eye and begin a conversation.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    number: '04',
    icon: Heart,
    title: 'Find Love',
    description: 'Meet in person, build meaningful connections, and start your love story.',
    color: 'from-red-500 to-pink-500',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="aurora-section py-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="section-badge mx-auto text-white/80">How it works</span>
          <h2 className="text-3xl md:text-5xl font-display gradient-heading">Four cinematic steps</h2>
          <p className="text-lg text-white/75 max-w-3xl mx-auto">
            A guided journey that mirrors the hero experience—immersive, safe, and impossibly smooth.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Number badge */}
                <div className="absolute -top-4 right-4">
                  <div className="frosted-pill text-sm font-semibold text-white/90 shadow-lg shadow-black/30">
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div className="glass-panel h-full p-8 transition hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-black/30`}
                  >
                    <Icon className="w-8 h-8 text-white" aria-hidden />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
