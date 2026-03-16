"use client";
import React, { useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type NavItem = {
  label: string;
  icon: string;
  href: string | { pathname: string; query?: Record<string, string> };
  badge?: number;
  panel?: string;
};

const navItems: NavItem[] = [
  { label: 'Matches', icon: '💜', href: '/dashboard' },
  { label: 'Messages', icon: '💬', href: '/dashboard/messages', badge: 2 },
  { label: 'Discover', icon: '🧭', href: '/dashboard/discover' },
  {
    label: 'Spaces',
    icon: '🌍',
    href: { pathname: '/dashboard', query: { panel: 'spaces' } },
    panel: 'spaces',
  },
  {
    label: 'My Spaces',
    icon: '⭐',
    href: { pathname: '/dashboard', query: { panel: 'myspaces' } },
    panel: 'myspaces',
  },
  { label: 'Profile', icon: '👤', href: '/dashboard/profile' },
  { label: 'Settings', icon: '⚙️', href: '/dashboard/settings' },
];

function Sidebar({ activeTab }: { activeTab?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelParam = searchParams?.get('panel')?.toLowerCase() ?? null;
  return (
    <>
      {/* Mobile sidebar toggle */}
      {!open && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-200 min-h-12 min-w-12 flex items-center justify-center"
          aria-label="Open sidebar"
          onClick={() => setOpen(true)}
          tabIndex={0}
          role="button"
        >
          <span className="text-lg" aria-hidden>☰</span>
        </button>
      )}
      
      {/* Mobile overlay */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`w-full md:w-64 bg-white border-r border-gray-100 flex flex-col py-6 md:py-8 px-4 md:px-6 shadow-md animate-fade-in fixed md:static top-0 left-0 h-full md:h-auto z-40 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        role="navigation"
        aria-label="Dashboard main navigation"
        tabIndex={0}
      >
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Image
              src="/images/default-avatar.png"
              alt="AmoraVibe"
              width={40}
              height={40}
              unoptimized
              className="rounded-full shadow-md flex-shrink-0"
              priority
            />
            <span className="font-extrabold text-lg md:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg truncate">AmoraVibe</span>
          </div>
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 min-h-12 min-w-12 flex items-center justify-center flex-shrink-0"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="text-2xl" aria-hidden>×</span>
          </button>
        </div>
        <nav className="flex-1 space-y-2 md:space-y-4 overflow-y-auto" aria-label="Dashboard sections">
            {navItems.map((item) => {
              const hrefPath = typeof item.href === 'string' ? item.href : item.href.pathname;
              const matchesPanel = item.panel ? panelParam === item.panel : false;
              
              // Exact match for /dashboard (Matches), strict prefix for others
              let matchesPath = false;
              if (typeof pathname === 'string' && hrefPath) {
                if (hrefPath === '/dashboard') {
                  // Only match /dashboard exactly when there's no panel param
                  matchesPath = pathname === '/dashboard' && !panelParam;
                } else {
                  // For other routes, match if pathname starts with the href and continues with / or is exact
                  matchesPath = pathname === hrefPath || pathname.startsWith(hrefPath + '/');
                }
              }
              
              const isActive = item.panel ? matchesPanel : matchesPath;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`menu-item flex items-center gap-3 px-4 md:px-6 py-3 md:py-3 rounded-full font-semibold text-base md:text-lg transition focus:outline-none focus:ring-2 focus:ring-fuchsia-200 min-h-12 ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-700 hover:bg-pink-50'}`}
                  aria-label={item.label}
                  tabIndex={0}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-xl md:text-lg drop-shadow flex-shrink-0" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-fuchsia-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0" aria-label="Unread messages badge" role="status">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
        <div className="mt-8 pt-6 md:pt-8 border-t border-gray-200 flex flex-col items-center gap-3">
          <button
            onClick={async () => {
              document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/';
            }}
            className="w-full rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-4 md:px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] min-h-12"
          >
            Sign Out
          </button>
        </div>
        <button
          className="mt-10 flex items-center gap-2 text-gray-500 hover:text-fuchsia-700 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
          aria-label="Logout"
          onClick={() => {
            fetch('/api/auth/signout', { method: 'POST' }).finally(() => { window.location.href = '/'; });
          }}
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
