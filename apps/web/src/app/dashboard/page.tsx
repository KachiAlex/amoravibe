import React from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import StatsCards from './components/StatsCards';
import ProfileCompletion from './components/ProfileCompletion';
import { getDashboardData } from './hooks/useDashboardData';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <main id="dashboard-main" className="flex-1 flex flex-col">
        <div className="flex-1 w-full">
          <div className="py-4 md:py-6">
            {/* Welcome Headline */}
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <Header
                userName={data?.userName}
                userFirstName={data?.userFirstName}
                userAvatar={data?.userAvatar}
                userOrientation={data?.userOrientation}
              />
            </div>

            {/* Stats Cards */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 mb-4 md:mb-6">
              <StatsCards stats={data?.stats} />
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Left Column: Tabs take 3 cols */}
                <div className="lg:col-span-3">
                  <Tabs messages={data?.messages} matches={data?.matches} />
                </div>

                {/* Right Column: Profile Completion */}
                <div className="lg:col-span-1 space-y-4">
                  <ProfileCompletion />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
