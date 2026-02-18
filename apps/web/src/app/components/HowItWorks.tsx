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
    <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to finding your perfect match
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 -z-10"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Number badge */}
                <div
                  className={`absolute -top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg z-10 hover:scale-110 transition-transform`}
                >
                  {step.number}
                </div>

                {/* Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group h-full">
                  {/* Icon background glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  ></div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
