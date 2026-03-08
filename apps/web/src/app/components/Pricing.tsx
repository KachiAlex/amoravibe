'use client';

import { Check, Sparkles } from 'lucide-react';
import { OpenOnboardingButton } from '@/app/onboarding/OpenOnboardingButton';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Create a profile',
      'Browse matches',
      'Send 5 likes per day',
      'Basic matching algorithm',
      'Standard support',
    ],
    color: 'from-gray-500 to-gray-600',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: 'per month',
    description: 'Most popular for serious daters',
    features: [
      'Everything in Free',
      'Unlimited likes',
      'See who liked you',
      'Advanced filters',
      'Priority support',
      'Read receipts',
      'Boost your profile',
    ],
    color: 'from-purple-600 to-pink-600',
    popular: true,
  },
  {
    name: 'Elite',
    price: '$39.99',
    period: 'per month',
    description: 'For those seeking the best experience',
    features: [
      'Everything in Premium',
      'Profile verification badge',
      'Exclusive matches',
      'Personal matchmaker',
      'Video chat access',
      'VIP support 24/7',
      'Monthly profile reviews',
      'Event invitations',
    ],
    color: 'from-blue-600 to-cyan-600',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="aurora-section py-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="section-badge mx-auto text-white/80">Membership</span>
          <h2 className="text-3xl md:text-5xl font-display gradient-heading">Choose your perfect plan</h2>
          <p className="text-lg text-white/75 max-w-2xl mx-auto">
            Start free and upgrade anytime to unlock concierge-grade features and priority intros.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}>
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div
                    className={`frosted-pill text-sm font-semibold text-white px-4 py-1.5`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`glass-panel overflow-hidden transition-all duration-300 h-full flex flex-col ${
                  plan.popular ? 'glass-panel--accent' : ''
                }`}
              >
                {/* Plan Header */}
                <div
                  className={`p-8 rounded-t-2xl ${plan.popular ? 'bg-white/5' : 'bg-white/[0.03]'}`}
                >
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-white/70 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end gap-2">
                    <span
                      className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-white/70 text-sm mb-2">/{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="p-8 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                        <span className="text-white/75">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="p-8 pt-0">
                  <OpenOnboardingButton
                    className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-full font-semibold transition-all text-center ${
                      plan.popular
                        ? 'iridescent-button'
                        : 'frosted-pill border-white/40 text-white'
                    }`}
                  >
                    {plan.name === 'Free' ? 'Get Started Free' : `Choose ${plan.name}`}
                  </OpenOnboardingButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12 text-white/70">
          <p>
            <span className="font-semibold text-white">30-day money-back guarantee</span> • Cancel anytime • No
            hidden fees
          </p>
        </div>
      </div>
    </section>
  );
}
