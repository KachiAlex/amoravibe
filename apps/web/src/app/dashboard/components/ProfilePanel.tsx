"use client";
import React, { useEffect, useState } from "react";

type Profile = {
  name: string;
  age: number;
  location: string;
  job: string;
  avatar: string;
  about: string;
  interests: string[];
};

export default function ProfilePanel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return <div className="text-center py-12 text-lg text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Stat Cards */}
      <div className="flex gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-5 flex-1 flex flex-col items-center">
          <div className="text-fuchsia-600 text-2xl mb-1">24</div>
          <div className="font-semibold text-gray-700">Total Matches</div>
          <div className="text-green-500 text-xs mt-1">+12 this week</div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex-1 flex flex-col items-center">
          <div className="text-fuchsia-600 text-2xl mb-1">18</div>
          <div className="font-semibold text-gray-700">Active Chats</div>
          <div className="text-green-500 text-xs mt-1">+5 today</div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex-1 flex flex-col items-center">
          <div className="text-fuchsia-600 text-2xl mb-1">156</div>
          <div className="font-semibold text-gray-700">Profile Views</div>
          <div className="text-purple-500 text-xs mt-1">Top 10%</div>
        </div>
      </div>
      {/* Your Profile Headline */}
      <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center relative">
        <button className="absolute top-6 right-6 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold px-5 py-2 rounded-full text-md shadow hover:scale-105 transition">
          Edit Profile
        </button>
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
          {profile.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="font-bold text-2xl mb-1">{profile.name}, {profile.age}</div>
        <div className="flex items-center gap-4 text-gray-500 mb-2">
          <span>📍 {profile.location}</span>
          <span>💼 {profile.job}</span>
        </div>
        <div className="w-full mt-8">
          <h4 className="font-semibold text-lg mb-2">About Me</h4>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-base mb-4">{profile.about}</div>
          <h4 className="font-semibold text-lg mb-2">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span key={interest} className="bg-gradient-to-r from-fuchsia-100 to-purple-100 text-fuchsia-700 px-4 py-2 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
