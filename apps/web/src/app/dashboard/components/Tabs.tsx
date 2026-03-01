"use client"
import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import type { Message } from '../types';
import MessagesPanel from './MessagesPanel';
import DiscoverPanel from './DiscoverPanel';
import ProfilePanel from './ProfilePanel';
import SettingsPanel from './SettingsPanel';
import SpacesPanel from './SpacesPanel';
import MySpacesPanel from './MySpacesPanel';

const DASHBOARD_TABS = [
  { id: 'messages', label: 'Messages' },
  { id: 'discover', label: 'Discover' },
  { id: 'spaces', label: 'Spaces' },
  { id: 'myspaces', label: 'My Spaces' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
];

export default function Tabs({ messages }: { messages?: Message[] }) {
  const tabs = DASHBOARD_TABS;

  const [active, setActive] = useState<string>(tabs[0].id);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]) as React.MutableRefObject<(HTMLButtonElement | null)[]>;

  useEffect(() => {
    // ensure the active tab button is focused when changed programmatically
    const idx = DASHBOARD_TABS.findIndex((t) => t.id === active);
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
      <div role="tablist" aria-label="Dashboard panels" onKeyDown={onKey} className="flex gap-4 mb-8 justify-center">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { btnRefs.current[i] = el; }}
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className={`px-6 py-3 rounded-full font-semibold text-lg shadow transition focus:outline-none focus:ring-2 focus:ring-fuchsia-200 ${
              active === t.id
                ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-fuchsia-50 border border-gray-200'
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

        <div id="panel-spaces" role="tabpanel" aria-labelledby="tab-spaces" hidden={active !== 'spaces'}>
          {active === 'spaces' && <SpacesPanel />}
        </div>

        <div id="panel-myspaces" role="tabpanel" aria-labelledby="tab-myspaces" hidden={active !== 'myspaces'}>
          {active === 'myspaces' && <MySpacesPanel />}
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
