import React from 'react';
import type { Message } from '../types';

export default function MessagesList({ messages }: { messages: Message[] }) {
  return (
    <section aria-label="Messages">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <div className="space-y-3" role="list">
        {messages.map((m) => (
          <div key={m.id} role="listitem" className="stat-card flex items-center gap-3">
            <img src={m.avatar} alt={`${m.from} avatar`} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex justify-between">
                <strong className="text-ink-700">{m.from}</strong>
                <span className="text-xs text-muted-500">{m.time}</span>
              </div>
              <p className="text-sm text-muted-500">{m.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
