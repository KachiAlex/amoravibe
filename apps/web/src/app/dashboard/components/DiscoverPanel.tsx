
import React, { useState } from "react";
import dynamic from "next/dynamic";

const DiscoverSwipePanel = dynamic(() => import("./DiscoverSwipePanel"), { ssr: false });

export default function DiscoverPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      <div className="flex gap-6 mt-2 mb-6">
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
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
        <div className="mb-4">
          <span className="inline-block bg-gradient-to-r from-fuchsia-500 to-purple-500 p-4 rounded-full">
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="16" fill="url(#gradient)" />
              <path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F500A3" />
                  <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Explore New Connections</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Swipe through profiles and find people who share your interests and values.
        </p>
        <button
          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-full text-lg shadow hover:scale-105 transition"
          onClick={() => setShowSwipe(true)}
        >
          Start Discovering
        </button>
      </div>
    </div>
  );
  const [showSwipe, setShowSwipe] = useState(false);

  if (showSwipe) {
    return <DiscoverSwipePanel onBack={() => setShowSwipe(false)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      ...existing code...
      {/* Discover New People Section */}
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
        ...existing code...
        <button
          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-full text-lg shadow hover:scale-105 transition"
          onClick={() => setShowSwipe(true)}
        >
          Start Discovering
        </button>
      </div>
    </div>
  );
}
}
