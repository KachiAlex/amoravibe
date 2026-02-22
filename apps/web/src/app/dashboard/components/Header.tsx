import React from 'react';

export default function Header({ userName = 'You' }: { userName?: string }) {
  return (
    <header className="flex items-center justify-between mb-8" role="banner">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-fuchsia-600">{userName}</span> <span aria-hidden>👋</span>
        </h1>
        <p className="text-gray-500 mt-1">Quick summary of your activity</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-200" aria-label="Open menu">
          <span aria-hidden>☰</span>
        </button>
        <input
          type="search"
          aria-label="Search profiles and interests"
          placeholder="Search profiles, interests..."
          className="rounded-full px-4 py-2 border border-gray-200 bg-[var(--card-bg)] shadow-sm"
        />
        <button className="relative p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-200" aria-label="Notifications">
          <span className="text-2xl" aria-hidden>
            🔔
          </span>
          <span className="absolute -top-1 -right-1 bg-fuchsia-500 text-white text-xs rounded-full px-1">!</span>
        </button>
        <div className="flex items-center gap-2 bg-fuchsia-100 px-3 py-1 rounded-full" aria-label="User menu">
          <span className="bg-fuchsia-500 text-white rounded-full px-2 py-1 font-bold">JD</span>
          <span className="font-medium text-fuchsia-700">{userName}</span>
        </div>
      </div>
    </header>
  );
}
