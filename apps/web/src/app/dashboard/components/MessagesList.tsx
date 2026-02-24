import React from 'react';
import type { Message } from '../types';

export default function MessagesList({ messages }: { messages: Message[] }) {
  return (
    <section aria-label="Messages">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <div className="space-y-3" role="list">
        {messages.map((m) => (
          <div key={m.id} role="listitem" className="stat-card flex items-center gap-4 p-4 rounded-2xl bg-white shadow border border-gray-100">
            <div className="relative">
              <img src={m.avatar} alt={`${m.from} avatar`} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow" title="Online"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <strong className="text-gray-900 truncate">{m.from}</strong>
                <span className="text-xs text-gray-500 whitespace-nowrap">{m.time}</span>
              </div>
              <p className="text-sm text-gray-500 break-words">{m.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
