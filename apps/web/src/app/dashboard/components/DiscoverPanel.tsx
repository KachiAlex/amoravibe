"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { trackEvent } from "@/lib/analytics";

type DiscoverSwipePanelProps = {
  filters: SwipeFilters;
  onBack?: () => void;
};

const DiscoverSwipePanel = dynamic<DiscoverSwipePanelProps>(() => import("./DiscoverSwipePanel"), {
  ssr: false,
});

const INTERESTS = ['Travel', 'Coffee', 'Design', 'Books', 'Hiking', 'Fitness', 'Food', 'Music'];

export type SwipeFilters = {
  radiusKm: number;
  ageRange: [number, number];
  interests: string[];
  verifiedOnly: boolean;
};

export default function DiscoverPanel() {
  const [showSwipe, setShowSwipe] = useState(false);
  const [radiusKm, setRadiusKm] = useState(100);
  const [ageRange, setAgeRange] = useState<[number, number]>([21, 45]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const swipeFilters = useMemo(
    () => ({
      radiusKm,
      ageRange,
      interests: selectedInterests,
      verifiedOnly,
    }),
    [radiusKm, ageRange, selectedInterests, verifiedOnly]
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleStart = () => {
    trackEvent("discover_start", {
      radiusKm,
      ageMin: ageRange[0],
      ageMax: ageRange[1],
      interests: selectedInterests,
      verifiedOnly,
    });
    setShowSwipe(true);
  };

  if (showSwipe) {
    return <DiscoverSwipePanel filters={swipeFilters} onBack={() => setShowSwipe(false)} />;
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
      {/* Discover New People Section */}
      <div className="bg-white rounded-2xl shadow p-10 flex flex-col gap-8 items-center">
        <span className="inline-block bg-gradient-to-r from-fuchsia-500 to-purple-500 p-6 rounded-full mb-6">
          <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
            <path d="M20 10v20M10 20h20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F500A3" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <h2 className="text-3xl font-bold mb-2">Discover New People</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md text-lg">
          Swipe through profiles and find people who share your interests and values.
        </p>
        <div className="w-full flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4 shadow-inner">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max distance</div>
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="accent-fuchsia-600 flex-1"
                />
                <span className="text-sm font-semibold text-gray-900">{radiusKm} km</span>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4 shadow-inner">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age range</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  type="range"
                  min={18}
                  max={80}
                  step={1}
                  value={ageRange[0]}
                  onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
                  className="accent-fuchsia-600 flex-1"
                />
                <span className="text-sm font-semibold text-gray-900">{ageRange[0]}</span>
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="range"
                  min={18}
                  max={80}
                  step={1}
                  value={ageRange[1]}
                  onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
                  className="accent-fuchsia-600 flex-1"
                />
                <span className="text-sm font-semibold text-gray-900">{ageRange[1]}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              Verified only
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                      active
                        ? "bg-fuchsia-600 text-white border-fuchsia-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-fuchsia-200"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold px-10 py-4 rounded-full text-xl shadow hover:scale-105 transition"
          onClick={handleStart}
        >
          Start Discovering
        </button>
      </div>
    </div>
  );
}
