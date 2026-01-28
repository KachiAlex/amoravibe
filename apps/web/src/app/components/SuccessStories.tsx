'use client';

import Image from 'next/image';
import { Quote, Heart } from 'lucide-react';

const testimonials = [
  {
    name: 'Emma & David',
    location: 'Chicago, IL',
    story:
      "We matched on AmoraVibe 8 months ago and got engaged last week! The platform's algorithm really understood what we were looking for.",
    image:
      'https://images.unsplash.com/photo-1594933878077-f15b1c406ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNvdXBsZSUyMGRhdGluZyUyMGNhZmV8ZW58MXx8fHwxNzY5NTMzODI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Marcus & Lisa',
    location: 'Los Angeles, CA',
    story:
      "After years of unsuccessful dating, AmoraVibe helped me find my soulmate. We've been together for a year and couldn't be happier!",
    image:
      'https://images.unsplash.com/photo-1758275557330-cfd545444dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwZnJpZW5kcyUyMGxhdWdoaW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzY5NTIxMzY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Alex & Jordan',
    location: 'Miami, FL',
    story:
      "The best decision I ever made was joining AmoraVibe. Met my partner within the first month, and we're planning our future together!",
    image:
      'https://images.unsplash.com/photo-1715614177635-8d1f3917671d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMHN1bnNldCUyMGNpdHlzY2FwZXxlbnwxfHx8fDE3Njk1MzM4MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-pink-500 to-red-500',
  },
];

export function SuccessStories() {
  return (
    <section id="success" className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/50 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-4">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real Love{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy couples who found their perfect match on AmoraVibe
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Quote Icon */}
                  <div
                    className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-700 mb-4 flex-1 italic">
                    &ldquo;{testimonial.story}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center`}
                    >
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-8">Join Our Success Stories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500K+</div>
              <div className="text-sm md:text-base opacity-90">Successful Matches</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-sm md:text-base opacity-90">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">150+</div>
              <div className="text-sm md:text-base opacity-90">Countries</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">2M+</div>
              <div className="text-sm md:text-base opacity-90">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
