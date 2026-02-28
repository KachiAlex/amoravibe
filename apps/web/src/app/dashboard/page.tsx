import React from 'react';
// Sidebar removed — single-column dashboard
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import MatchesGrid from './components/MatchesGrid';
import Tabs from './components/Tabs';
import { DashboardMessagesWidget } from './components/DashboardMessagesWidget';
import { getDashboardData } from './hooks/useDashboardData';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <div className="flex-1 flex flex-col min-h-screen h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50">
      <main id="dashboard-main" className="flex-1 flex flex-col min-h-screen h-screen">
        <div className="flex-1 w-full min-h-screen h-full md:rounded-l-xl shadow-lg bg-white/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
            {/* Welcome Headline */}
            <Header userName={data?.userName} />
            {/* Stat Cards */}
            <StatsCards stats={data?.stats ?? { matches: 0, chats: 0, views: 0 }} />
            {/* Your Matches Section */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
              <MatchesGrid matches={data?.matches ?? []} />
            </div>

            {/* Inbox Snapshot */}
            <div className="mt-12">
              <DashboardMessagesWidget messages={data?.messages ?? []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
