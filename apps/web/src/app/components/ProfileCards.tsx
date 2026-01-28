'use client';

import Image from 'next/image';
import { Heart, MapPin, Star } from 'lucide-react';

const profiles = [
  {
    name: 'Sarah Johnson',
    age: 28,
    location: 'New York, NY',
    interests: ['Photography', 'Travel', 'Coffee'],
    image:
      'https://images.unsplash.com/photo-1724941407869-f8fb46a3cc38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwc21pbGV8ZW58MXx8fHwxNzY5NTMzODI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    match: 95,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Michael Chen',
    age: 31,
    location: 'San Francisco, CA',
    interests: ['Hiking', 'Cooking', 'Music'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    match: 92,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Emma Davis',
    age: 26,
    location: 'Austin, TX',
    interests: ['Yoga', 'Reading', 'Art'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
    match: 89,
    gradient: 'from-pink-500 to-red-500',
  },
  {
    name: 'James Wilson',
    age: 29,
    location: 'Seattle, WA',
    interests: ['Tech', 'Gaming', 'Fitness'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
    match: 94,
    gradient: 'from-green-500 to-emerald-500',
  },
];

export function ProfileCards() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Amazing People
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with singles who share your interests and values
          </p>
        </div>

        {/* Profile Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Match Percentage Badge */}
                  <div
                    className={`absolute top-4 right-4 bg-gradient-to-br ${profile.gradient} text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg hover:scale-110 transition-transform`}
                  >
                    <Star className="w-4 h-4 fill-white" />
                    {profile.match}%
                  </div>

                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-xl font-bold mb-1">
                      {profile.name}, {profile.age}
                    </h3>
                    <div className="flex items-center gap-1 text-sm mb-3 opacity-90">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  </div>

                  {/* Like Button */}
                  <button className="absolute bottom-5 right-5 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
                    <Heart className="w-6 h-6 text-pink-500 group-hover:fill-pink-500 transition-colors" />
                  </button>
                </div>

                {/* Interests Tags */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium transition-all duration-300 hover:shadow-lg">
            View More Profiles
          </button>
        </div>
      </div>
    </section>
  );
}
