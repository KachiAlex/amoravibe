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
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade anytime to unlock premium features
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
                    className={`bg-gradient-to-r ${plan.color} text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col ${
                  plan.popular ? 'ring-2 ring-purple-600 ring-offset-4' : ''
                }`}
              >
                {/* Plan Header */}
                <div
                  className={`p-8 rounded-t-2xl ${plan.popular ? 'bg-gradient-to-br from-purple-50 to-pink-50' : ''}`}
                >
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end gap-2">
                    <span
                      className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-sm mb-2">/{plan.period}</span>
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
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="p-8 pt-0">
                  <OpenOnboardingButton
                    className={`w-full inline-block py-3 px-6 rounded-full font-medium transition-all text-center ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900'
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
        <div className="text-center mt-12">
          <p className="text-gray-600">
            <span className="font-semibold">30-day money-back guarantee</span> • Cancel anytime • No
            hidden fees
          </p>
        </div>
      </div>
    </section>
  );
}
