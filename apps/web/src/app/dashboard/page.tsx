import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import MatchesGrid from './components/MatchesGrid';
import MessagesList from './components/MessagesList';
import Tabs from './components/Tabs';
import { getDashboardData } from './hooks/useDashboardData';

import DashboardLayout from "./layout";
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <DashboardLayout>
      <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
        <Sidebar />
        <main id="dashboard-main" className="flex-1 px-4 md:px-12 py-10 max-w-7xl mx-auto">
          {/* Welcome Headline */}
          <Header userName={data?.userName} />
          {/* Stat Cards */}
          <StatsCards stats={data?.stats ?? { matches: 0, chats: 0, views: 0 }} />
          {/* Your Matches Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
            <MatchesGrid matches={data?.matches ?? []} />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
