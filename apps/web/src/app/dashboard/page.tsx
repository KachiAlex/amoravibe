import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import MatchesList from './components/MatchesList';
import MessagesList from './components/MessagesList';
import Tabs from './components/Tabs';
import { getDashboardData } from './hooks/useDashboardData';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex min-h-screen bg-transparent">
      <a href="#dashboard-main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:px-3 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-fuchsia-200">Skip to main content</a>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:px-3 focus:py-2 focus:rounded-md" title="Skip to main content">
        Skip to main content
      </a>
      <Sidebar />
      <main id="dashboard-main" className="flex-1 px-12 py-10" tabIndex={-1}>
        <Header userName={data?.userName} />
        <StatsCards stats={data?.stats ?? { matches: 0, chats: 0, views: 0 }} />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <MatchesList matches={data?.matches ?? []} />
            <div className="mt-8">
              <MessagesList messages={data?.messages ?? []} />
            </div>
          </div>
          <aside className="space-y-6">
            <Tabs messages={data?.messages ?? []} />
          </aside>
        </div>
      </main>
    </div>
  );
}
