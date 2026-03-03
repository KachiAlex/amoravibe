"use client";

import React from "react";
import type { DashboardData } from "../hooks/useDashboardData";
import MatchesListClient from "./MatchesListClient";

interface DashboardTabsProps {
  data: DashboardData;
}

export function DashboardTabs({ data }: DashboardTabsProps) {
  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
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
            <MatchesListClient initialMatches={data?.matches ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
