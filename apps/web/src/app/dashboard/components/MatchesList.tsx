"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Match } from "../types";
import { defaultAvatar } from "@/lib/assets";

function getPreview(m: Match) {
  if (m.about) return m.about.slice(0, 50) + (m.about.length > 50 ? "..." : "");
  if (m.tagline) return m.tagline;
  return "Hey! Let's connect";
}

function getTimeAgo() {
  const times = ["2m ago", "1h ago", "2h ago", "1d ago", "2d ago", "3d ago"];
  return times[Math.floor(Math.random() * times.length)];
}

export default function MatchesList({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<"all" | "liked">("all");

  const displayed = filter === "all" ? matches : matches.filter((_, i) => i % 3 === 0);

  return (
    <section aria-label="Matches" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" aria-label="Filter">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toggle */}
      <div className="px-6 mb-4">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              filter === "all"
                ? "bg-fuchsia-500 text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setFilter("liked")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              filter === "liked"
                ? "bg-fuchsia-500 text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Liked You
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1">
        {displayed.length === 0 && (
          <div className="text-center text-gray-400 py-12">No matches yet.</div>
        )}
        {displayed.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition cursor-pointer group"
          >
            {/* Avatar with online dot */}
            <div className="relative flex-shrink-0">
              <Image
                src={m.avatar || defaultAvatar}
                alt={`${m.name} avatar`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover"
                unoptimized
              />
              {m.online && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 truncate">{m.name}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{getTimeAgo()}</span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{getPreview(m)}</p>
            </div>

            {/* Unread badge on some items */}
            {i % 4 === 0 && (
              <span className="flex-shrink-0 w-6 h-6 bg-fuchsia-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                1
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
