import React from 'react';

export default function Header({ userName = 'You' }: { userName?: string }) {
  return (
    <header className="flex items-center justify-between mb-8" role="banner">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{userName}</span> <span aria-hidden>👋</span>
        </h1>
        <p className="text-gray-500 mt-1">Quick summary of your activity</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200" aria-label="Open menu">
          <span aria-hidden>☰</span>
        </button>
        <input
          type="search"
          aria-label="Search profiles and interests"
          placeholder="Search profiles, interests..."
          className="rounded-full px-4 py-2 border border-gray-200 bg-white shadow-sm w-64"
        />
        <button className="relative p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200" aria-label="Notifications">
          <span className="text-2xl" aria-hidden>
            🔔
          </span>
          <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full px-1">!</span>
        </button>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm" aria-label="User menu">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-2 py-1 font-bold">JD</span>
          <span className="font-medium text-gray-900">{userName}</span>
        </div>
      </div>
    </header>
  );
}
