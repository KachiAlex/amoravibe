import React, { useState } from 'react';
import Link from 'next/link';

const navItems = [
  { label: 'Matches', icon: '💜', href: '/dashboard' },
  { label: 'Messages', icon: '💬', href: '/dashboard/messages', badge: 2 },
  { label: 'Discover', icon: '🧭', href: '/dashboard/discover' },
  { label: 'Profile', icon: '👤', href: '/dashboard/profile' },
  { label: 'Settings', icon: '⚙️', href: '/dashboard/settings' },
];

function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
        aria-label="Open sidebar"
        onClick={() => setOpen(true)}
        tabIndex={0}
        role="button"
      >
        <span aria-hidden>☰</span>
      </button>
      {/* Sidebar */}
      <aside
        className={`w-64 bg-gradient-to-b from-purple-50 via-pink-50 to-white border-r border-gray-100 flex flex-col py-8 px-6 shadow-xl animate-fade-in fixed md:static top-0 left-0 h-full z-40 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        role="navigation"
        aria-label="Dashboard main navigation"
        tabIndex={0}
      >
        <div className="flex items-center gap-2 mb-8">
          <span className="text-3xl" aria-hidden>
            💜
          </span>
          <span className="font-extrabold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AmoraVibe</span>
        </div>
        <nav className="flex-1 space-y-4" aria-label="Dashboard sections">
          {navItems.map((item) => {
            const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`menu-item flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-lg shadow transition focus:outline-none focus:ring-2 focus:ring-fuchsia-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200'
                }`}
                aria-label={item.label}
                tabIndex={0}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl" aria-hidden>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-fuchsia-500 text-white text-xs rounded-full px-2 py-0.5" aria-label="Unread messages badge" role="status">{item.badge}</span>
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
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 bg-white text-purple-600 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden>✕</span>
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
