"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { DashboardData } from "../hooks/useDashboardData";

const SpacesPanel = dynamic(() => import("./SpacesPanel"), { ssr: false });
const MySpacesPanel = dynamic(() => import("./MySpacesPanel"), { ssr: false });
const DiscoverPanel = dynamic(() => import("./DiscoverPanel"), { ssr: false });
const MessagesPanel = dynamic(() => import("./MessagesPanel"), { ssr: false });
const ProfilePanel = dynamic(() => import("./ProfilePanel"), { ssr: false });

type Tab = "home" | "spaces" | "myspaces" | "discover" | "messages" | "profile";

interface DashboardTabsProps {
  data: DashboardData;
}

export function DashboardTabs({ data }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "spaces", label: "Spaces", icon: "🌍" },
    { id: "myspaces", label: "My Spaces", icon: "⭐" },
    { id: "discover", label: "Discover", icon: "🔍" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {activeTab === "home" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome to AmoraVibe</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">Your Matches</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data?.matches ?? []).length > 0 ? (
                  (data?.matches ?? []).map((match: any) => (
                    <div
                      key={match.id}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="font-semibold">{match.name}</div>
                      <div className="text-sm text-gray-600">{match.location}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No matches yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "spaces" && <SpacesPanel />}
        {activeTab === "myspaces" && <MySpacesPanel />}
        {activeTab === "discover" && <DiscoverPanel />}
        {activeTab === "messages" && <MessagesPanel />}
        {activeTab === "profile" && <ProfilePanel />}
      </div>
    </div>
  );
}
