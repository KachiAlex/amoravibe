"use client"
import React, { useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Message } from '../types';
import MatchesGrid from './MatchesGrid';
import MessagesPanel from './MessagesPanel';
import DiscoverPanel from './DiscoverPanel';
import dynamic from 'next/dynamic';
const ProfilePanel = dynamic(() => import('./ProfilePanel'), { ssr: false });
import SettingsPanel from './SettingsPanel';
import SpacesPanel from './SpacesPanel';
import MySpacesPanel from './MySpacesPanel';

const VISIBLE_TABS = [
  { id: 'matches', label: 'Matches' },
  { id: 'messages', label: 'Messages' },
  { id: 'discover', label: 'Discover' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
];

const ALL_PANELS = ['matches', 'messages', 'discover', 'spaces', 'myspaces', 'profile', 'settings'] as const;
type PanelId = (typeof ALL_PANELS)[number];

export default function Tabs({ messages }: { messages?: Message[] }) {
  const tabs = VISIBLE_TABS;
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPanel = useMemo<PanelId>(() => {
    const param = (searchParams?.get('panel') || '').toLowerCase();
    return (ALL_PANELS as readonly string[]).includes(param) ? (param as PanelId) : 'matches';
  }, [searchParams]);

  const [active, setActive] = useState<PanelId>(initialPanel);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]) as React.MutableRefObject<(HTMLButtonElement | null)[]>;

  useEffect(() => {
    const param = (searchParams?.get('panel') || '').toLowerCase();
    if ((ALL_PANELS as readonly string[]).includes(param) && param !== active) {
      setActive(param as PanelId);
    }
  }, [searchParams, active]);

  useEffect(() => {
    // ensure the active tab button is focused when changed programmatically
    const idx = VISIBLE_TABS.findIndex((t) => t.id === active);
    btnRefs.current[idx]?.focus();
  }, [active]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const idx = tabs.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActive(tabs[(idx + 1) % tabs.length].id as PanelId);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive(tabs[(idx - 1 + tabs.length) % tabs.length].id as PanelId);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActive(tabs[0].id as PanelId);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setActive(tabs[tabs.length - 1].id as PanelId);
      return;
    }
  }

  function updatePanel(id: PanelId) {
    setActive(id);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('panel', id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div>
        <div id="panel-matches" role="tabpanel" aria-labelledby="tab-matches" hidden={active !== 'matches'}>
          {active === 'matches' && <MatchesGrid />}
        </div>

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
