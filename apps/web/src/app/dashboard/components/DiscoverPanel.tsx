"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const DiscoverSwipePanel = dynamic(() => import("./DiscoverSwipePanel"), { ssr: false });

export default function DiscoverPanel() {
  const [showSwipe, setShowSwipe] = useState(false);
  if (showSwipe) {
    return <DiscoverSwipePanel onBack={() => setShowSwipe(false)} />;
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
      <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center">
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
        <button
          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold px-10 py-4 rounded-full text-xl shadow hover:scale-105 transition"
          onClick={() => setShowSwipe(true)}
        >
          Start Discovering
        </button>
      </div>
    </div>
  );
}
