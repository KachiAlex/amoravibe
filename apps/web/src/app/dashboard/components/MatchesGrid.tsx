"use client";
import React, { useState } from "react";

export default function MatchesGrid({ matches }: { matches: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
      {matches.map((m) => (
        <div
          key={m.id}
          className="relative group bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col transition-transform hover:scale-105"
        >
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-fuchsia-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow mr-2">
              {m.matchPercent || "95%"} Match
            </span>
            {m.isNew && (
              <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow">
                New Match
              </span>
            )}
          </div>
          {/* Avatar */}
          <img
            src={m.avatar || "/images/default-avatar.png"}
            alt={m.name}
            className="w-full h-72 object-cover"
          />
          {/* Info */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="font-bold text-2xl mb-1">{m.name}, {m.age}</div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span>💼 {m.job}</span>
              <span>📍 {m.location}</span>
            </div>
            <div className="text-gray-700 text-base mt-2 line-clamp-2">{m.about}</div>
          </div>
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button title="Pass" className="bg-white/80 hover:bg-white text-red-500 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg">
              &#10006;
            </button>
            <button title="Message" className="bg-white/80 hover:bg-white text-blue-500 rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg">
              &#9993;
            </button>
            <button title="Like" className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg">
              &#10084;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
