"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type Message = {
  id: string;
  from: string;
  avatar?: string;
  preview?: string;
  text?: string;
  time?: string;
};

type MessagesPanelProps = { initialMessages?: Message[] };

export default function MessagesPanel({ initialMessages = [] }: MessagesPanelProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);

  const hasInitialMessages = initialMessages.length > 0;

  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch (if needed)
    if (!hasInitialMessages) {
      fetch('/api/messages', { credentials: 'same-origin' })
        .then((r) => r.json())
        .then((data) => {
          if (isMounted) setMessages(Array.isArray(data) ? data : []);
        })
        .catch(() => setError('Failed to load messages'));
    }

    // Real-time SSE connection for new messages
    const eventSource = new EventSource('/api/messages/stream', { withCredentials: true });
    
    eventSource.onmessage = (event) => {
      if (!isMounted) return;
      try {
        const newMessage = JSON.parse(event.data);
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    eventSource.onerror = () => {
      if (isMounted) {
        setError('Connection lost. Attempting to reconnect...');
        eventSource.close();
      }
    };

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, [hasInitialMessages]);

  return (
    <section aria-label="Messages panel" className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold">Messages</h3>
        <div className="flex gap-2">
          <button className="px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow">All</button>
          <button className="px-5 py-2 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow">Unread (2)</button>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-4">
        {messages.length === 0 && <div className="text-center text-gray-400">No messages yet.</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl shadow flex items-center gap-4 p-6 relative group hover:shadow-lg transition border border-gray-100"
          >
            <Image
              src={m.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={`${m.from} avatar`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              unoptimized
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-lg truncate flex items-center gap-2">
                  {m.from}
                </span>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{m.time}</span>
              </div>
              <div className="text-base text-gray-700 break-words mb-2">{m.preview || m.text}</div>
            </div>
            <span className="absolute top-6 right-6 w-3 h-3 bg-fuchsia-500 rounded-full" title="Unread"></span>
          </div>
        ))}
      </div>
    </section>
  );
}
