import React from 'react';
// Sidebar removed — single-column dashboard
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import MatchesGrid from './components/MatchesGrid';
import MessagesList from './components/MessagesList';
import Tabs from './components/Tabs';
import { getDashboardData } from './hooks/useDashboardData';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <div className="w-full flex">
      <main id="dashboard-main" className="flex-1 min-h-screen">
        <div className="bg-white w-full min-h-screen md:rounded-l-xl shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            {/* Welcome Headline */}
            <Header userName={data?.userName} />
            {/* Stat Cards */}
            <StatsCards stats={data?.stats ?? { matches: 0, chats: 0, views: 0 }} />
            {/* Your Matches Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
              <MatchesGrid matches={data?.matches ?? []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
