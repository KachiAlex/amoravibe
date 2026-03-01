import React from 'react';
import Header from './components/Header';
import { DashboardTabs } from './components/DashboardTabs';
import { getDashboardData } from './hooks/useDashboardData';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50">
      <main id="dashboard-main" className="flex-1 flex flex-col">
        <div className="flex-1 w-full md:rounded-l-xl shadow-lg bg-white/90 backdrop-blur-md">
          <div className="py-10">
            {/* Welcome Headline */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <Header userName={data?.userName} />
            </div>
            {/* Tabbed Interface */}
            <DashboardTabs data={data} />
          </div>
        </div>
      </main>
    </div>
  );
}
