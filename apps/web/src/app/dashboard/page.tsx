import React from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import StatsCards from './components/StatsCards';
import ProfileCompletion from './components/ProfileCompletion';
import FloatingMessenger from './components/FloatingMessenger';
import { getDashboardData } from './hooks/useDashboardData';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50">
      <main id="dashboard-main" className="flex-1 flex flex-col">
        <div className="flex-1 w-full md:rounded-l-xl shadow-lg bg-white/90 backdrop-blur-md">
          <div className="py-6 md:py-10">
            {/* Welcome Headline */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <Header
                userName={data?.userName}
                userFirstName={data?.userFirstName}
                userAvatar={data?.userAvatar}
                userOrientation={data?.userOrientation}
              />
            </div>

            {/* Stats Cards */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 mb-6 md:mb-10">
              <StatsCards stats={data?.stats} />
            </div>

            {/* Main Content Grid */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Left Column: Tabs take 3 cols */}
                <div className="lg:col-span-3">
                  <Tabs messages={data?.messages} matches={data?.matches} />
                </div>

                {/* Right Column: Profile Completion + Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                  <ProfileCompletion />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FloatingMessenger />
    </div>
  );
}
