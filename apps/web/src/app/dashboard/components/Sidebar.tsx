import React from 'react';
import Link from 'next/link';

const navItems = [
  { label: 'Matches', icon: '💜', href: '/dashboard' },
  { label: 'Messages', icon: '💬', href: '/dashboard/messages', badge: 2 },
  { label: 'Discover', icon: '🧭', href: '/dashboard/discover' },
  { label: 'Profile', icon: '👤', href: '/dashboard/profile' },
  { label: 'Settings', icon: '⚙️', href: '/dashboard/settings' },
];

export default function Sidebar() {
  return (
    <aside
      className="w-60 bg-[color:var(--card-bg)/.9] border-r border-gray-100 flex flex-col py-8 px-4"
      role="navigation"
      aria-label="Dashboard main navigation"
    >
      <div className="flex items-center gap-2 mb-8">
        <span className="text-3xl" aria-hidden>
          💜
        </span>
        <span className="font-bold text-xl text-fuchsia-700">AmoraVibe</span>
      </div>
      <nav className="flex-1 space-y-4" aria-label="Sections">
        {navItems.map((item) => {
          const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-lg shadow transition focus:outline-none focus:ring-2 focus:ring-fuchsia-200 ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white scale-105'
                  : 'bg-white text-gray-700 hover:bg-fuchsia-50 border border-gray-200'
              }`}
              aria-label={item.label}
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-fuchsia-500 text-white text-xs rounded-full px-2 py-0.5">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        className="mt-10 flex items-center gap-2 text-gray-500 hover:text-fuchsia-700 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
        aria-label="Logout"
      >
        <span aria-hidden>↩️</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}
