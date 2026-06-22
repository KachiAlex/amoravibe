"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  LayoutGrid,
  MessageCircle,
  Compass,
  Globe,
  Star,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string | { pathname: string; query?: Record<string, string> };
  badge?: number;
  panel?: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
  { label: 'Matches', icon: Heart, href: '/dashboard', panel: 'matches' },
  { label: 'Messages', icon: MessageCircle, href: '/dashboard/messages' },
  { label: 'Discover', icon: Compass, href: '/dashboard/discover' },
  { label: 'Spaces', icon: Globe, href: { pathname: '/dashboard', query: { panel: 'spaces' } }, panel: 'spaces' },
  { label: 'My Spaces', icon: Star, href: { pathname: '/dashboard', query: { panel: 'myspaces' } }, panel: 'myspaces' },
  { label: 'Profile', icon: User, href: '/dashboard/profile' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

function Sidebar({ activeTab }: { activeTab?: string }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelParam = searchParams?.get('panel')?.toLowerCase() ?? null;

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/messages/conversations', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const convs = data.conversations || [];
        const total = convs.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
        setUnreadCount(total);
      } catch {
        // ignore
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed bottom-6 left-6 z-50 bg-white text-fuchsia-500 rounded-full p-3 shadow-lg border border-gray-100"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static top-0 left-0 h-full z-40 w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 transition-transform duration-300`}
      >
        {/* Logo */}
        <Link href="/dashboard" className="mb-8">
          <Heart className="w-7 h-7 text-fuchsia-500 fill-fuchsia-500" />
        </Link>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-6" aria-label="Dashboard sections">
          {navItems.map((item) => {
            const hrefPath = typeof item.href === 'string' ? item.href : item.href.pathname;
            const matchesPanel = item.panel ? panelParam === item.panel : false;
            let matchesPath = false;
            if (typeof pathname === 'string' && hrefPath) {
              if (hrefPath === '/dashboard') {
                matchesPath = pathname === '/dashboard' && !panelParam;
              } else {
                matchesPath = pathname === hrefPath || pathname.startsWith(hrefPath + '/');
              }
            }
            const isActive = item.panel ? matchesPanel : matchesPath;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative p-2.5 rounded-xl transition ${
                  isActive
                    ? ' bg-fuchsia-500 text-white shadow-md'
                    : ' text-gray-400 hover:text-fuchsia-500 hover:bg-fuchsia-50'
                }`}
                aria-label={item.label}
                onClick={() => setOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.label === 'Messages' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-fuchsia-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <button
          onClick={() => {
            document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/';
          }}
          className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition mt-4"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
