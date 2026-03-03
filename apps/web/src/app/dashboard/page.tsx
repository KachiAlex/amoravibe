import React from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import MatchesGrid from './components/MatchesGrid';
import { getDashboardData } from './hooks/useDashboardData';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  const searchParams = { get: (key: string) => null }; // Server component doesn't have searchParams
  
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50">
      <main id="dashboard-main" className="flex-1 flex flex-col">
        <div className="flex-1 w-full md:rounded-l-xl shadow-lg bg-white/90 backdrop-blur-md">
          <div className="py-10">
            {/* Welcome Headline */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <Header userName={data?.userName} />
            </div>
            
            {/* Stats Cards */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {data?.stats?.matches ?? 0}
                  </div>
                  <div className="text-gray-700">Matches</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {data?.stats?.chats ?? 0}
                  </div>
                  <div className="text-gray-700">Chats</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6">
                  <div className="text-3xl font-bold text-pink-600 mb-2">
                    {data?.stats?.views ?? 0}
                  </div>
                  <div className="text-gray-700">Views</div>
                </div>
              </div>
            </div>

            {/* Tabbed Interface with all panels */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <Tabs messages={data?.messages} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
