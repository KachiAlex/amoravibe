"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type UnreadCount = {
  total: number;
};

export default function FloatingMessenger() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch initial unread count
    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Subscribe to real-time updates via SSE
    const eventSource = new EventSource('/api/messages/stream?unreadOnly=true');
    eventSource.onmessage = () => {
      fetchUnreadCount();
    };
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  async function fetchUnreadCount() {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      const convs = data.conversations || [];
      const total = convs.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
      setUnreadCount(total);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }

  return (
    <>
      {/* Floating Messenger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Quick messages preview (optional) */}
        {isOpen && (
          <div className="absolute bottom-24 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-96 animate-slideUp">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Messages</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className="text-sm text-gray-500 text-center py-8">
                Open Messages tab for full view
              </p>
            </div>
            <div className="border-t px-4 py-3">
              <Link
                href="/dashboard/messages"
                className="block w-full text-center py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition"
              >
                Open Messages
              </Link>
            </div>
          </div>
        )}

        {/* Main Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group"
          aria-label="Messages"
          title={unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'Messages'}
        >
          {/* Animated rings on background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-lg transition-opacity" />

          {/* Main button */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-pointer transform group-hover:scale-110 duration-200">
            <Image
              src="/images/default-avatar.png"
              alt="Messages"
              width={64}
              height={64}
              className="w-14 h-14 rounded-full object-cover border-2 border-white"
              priority
            />

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}

            {/* Status dot */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
        </button>

        {/* Tooltip on hover */}
        <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Messages
        </div>
      </div>

      {/* Global styles for animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
