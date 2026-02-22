"use client"
import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import dynamic from 'next/dynamic';
import type { Message } from '../types';

const MessagesPanel = dynamic(() => import('./MessagesPanel'), {
  loading: () => <div className="stat-card">Loading messages...</div>,
  ssr: false,
});
const DiscoverPanel = dynamic(() => import('./DiscoverPanel'), {
  loading: () => <div className="stat-card">Loading...</div>,
  ssr: false,
});
const ProfilePanel = dynamic(() => import('./ProfilePanel'), {
  loading: () => <div className="stat-card">Loading profile...</div>,
  ssr: false,
});
const SettingsPanel = dynamic(() => import('./SettingsPanel'), {
  loading: () => <div className="stat-card">Loading settings...</div>,
  ssr: false,
});

export default function Tabs({ messages }: { messages?: Message[] }) {
  const tabs = [
    { id: 'messages', label: 'Messages' },
    { id: 'discover', label: 'Discover' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
  ];

  const [active, setActive] = useState<string>(tabs[0].id);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    // ensure the active tab button is focused when changed programmatically
    const idx = tabs.findIndex((t) => t.id === active);
    btnRefs.current[idx]?.focus();
  }, [active]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const idx = tabs.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActive(tabs[(idx + 1) % tabs.length].id);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive(tabs[(idx - 1 + tabs.length) % tabs.length].id);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActive(tabs[0].id);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setActive(tabs[tabs.length - 1].id);
      return;
    }
  }

  return (
    <div>
      <div role="tablist" aria-label="Dashboard panels" onKeyDown={onKey} className="flex gap-2 mb-4">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (btnRefs.current[i] = el)}
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className={`px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-200 ${
              active === t.id ? 'bg-fuchsia-600 text-white' : 'bg-white text-gray-700 hover:bg-fuchsia-50'
            }`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <div id="panel-messages" role="tabpanel" aria-labelledby="tab-messages" hidden={active !== 'messages'}>
          {active === 'messages' && <MessagesPanel initialMessages={messages ?? []} />}
        </div>

        <div id="panel-discover" role="tabpanel" aria-labelledby="tab-discover" hidden={active !== 'discover'}>
          {active === 'discover' && <DiscoverPanel />}
        </div>

        <div id="panel-profile" role="tabpanel" aria-labelledby="tab-profile" hidden={active !== 'profile'}>
          {active === 'profile' && <ProfilePanel />}
        </div>

        <div id="panel-settings" role="tabpanel" aria-labelledby="tab-settings" hidden={active !== 'settings'}>
          {active === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}
