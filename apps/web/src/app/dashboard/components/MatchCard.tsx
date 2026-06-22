"use client";
import React from "react";
import Image from "next/image";
import type { Match } from "../types";
import { defaultAvatar } from "@/lib/assets";

type MatchCardProps = {
  match: Match;
  onAction: (id: string, action: string) => void;
};

export default React.memo(function MatchCard({ match, onAction }: MatchCardProps) {
  return (
    <div className="relative group bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      {/* Match percentage badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-white/90 backdrop-blur-sm text-fuchsia-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {match.matchPercent ? `${match.matchPercent}%` : "95%"} Match
        </span>
      </div>

      {/* Heart action button */}
      <button
        title="Like"
        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-fuchsia-500 rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-all hover:scale-110"
        onClick={(e) => {
          e.preventDefault();
          onAction(match.id, "like");
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Avatar with online indicator */}
      <div className="relative">
        <Image
          src={match.avatar || defaultAvatar}
          alt={match.name}
          width={400}
          height={320}
          className="w-full h-64 object-cover"
          quality={85}
          priority={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          unoptimized={!match.avatar}
        />
        {match.online && (
          <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* Card content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-bold text-lg text-gray-900 mb-0.5">
          {match.name}
          {match.age ? `, ${match.age}` : ""}
        </div>
        <div className="text-gray-500 text-sm mb-1">
          {match.job || match.location ? (
            <span>{[match.job, match.location].filter(Boolean).join(" \u2022 ")}</span>
          ) : (
            <span className="text-gray-400">New connection</span>
          )}
        </div>
        {match.about && <div className="text-gray-600 text-sm mt-1 line-clamp-2">{match.about}</div>}
      </div>

      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <button
          title="Pass"
          className="pointer-events-auto bg-white text-red-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => {
            e.preventDefault();
            onAction(match.id, "pass");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <a
          title="Message"
          href="/dashboard/messages"
          className="pointer-events-auto bg-white text-blue-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => e.stopPropagation()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </a>
        <button
          title="Like"
          className="pointer-events-auto bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          onClick={(e) => {
            e.preventDefault();
            onAction(match.id, "like");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});
