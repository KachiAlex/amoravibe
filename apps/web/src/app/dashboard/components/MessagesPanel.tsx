"use client"
import React, { useEffect, useState } from 'react';

type Message = {
  id: string;
  from: string;
  avatar?: string;
  preview?: string;
  text?: string;
  time?: string;
};

export default function MessagesPanel({ initialMessages = [] }: { initialMessages?: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // hydrate from server on mount (if server provided none)
    if (messages.length === 0) {
      fetch('/api/messages', { credentials: 'same-origin' })
        .then((r) => r.json())
        .then((data) => setMessages(data.messages || []))
        .catch(() => {});
    }
  }, []);

  async function sendMessage() {
    if (!text.trim()) return;
    const optimistic = {
      id: `tmp-${Date.now()}`,
      from: 'You',
      preview: text.slice(0, 120),
      text,
      time: 'just now',
    };
    setMessages((s) => [optimistic, ...s]);
    setText('');
    setLoading(true);
    try {
      // send with credentials so cookies are included
      let res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ text: optimistic.text }),
      });

      // if unauthorized, try a one-time re-login and retry once
      if (res.status === 401) {
        try {
          await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ username: 'guest' }) });
          res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ text: optimistic.text }),
          });
        } catch (e) {
          // fall through to error handling below
        }
      }

      const body = await res.json().catch(() => ({}));
      if (body?.message) {
        // replace optimistic with server message id
        setMessages((s) => s.map((m) => (m.id === optimistic.id ? body.message : m)));
      } else {
        // rollback optimistic on unexpected response
        setMessages((s) => s.filter((m) => m.id !== optimistic.id));
        console.error('Send failed', body);
      }
    } catch (e) {
      // rollback optimistic on error
      setMessages((s) => s.filter((m) => m.id !== optimistic.id));
      console.error('Send failed', e);
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    // Optionally: send delete to server
    fetch(`/api/messages/${id}`, { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
  }

  return (
    <section aria-label="Messages panel">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Messages</h3>
        <div className="flex gap-2">
          <button className="px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-fuchsia-500 to-purple-500 shadow">All</button>
          <button className="px-5 py-2 rounded-full font-semibold text-fuchsia-700 bg-fuchsia-100 hover:bg-fuchsia-200 shadow">Unread (2)</button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {messages.length === 0 && <div className="text-center text-ink-300">No messages yet.</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl shadow flex items-center gap-4 p-6 relative group hover:shadow-lg transition"
          >
            <img
              src={m.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-fuchsia-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-lg truncate flex items-center gap-2">
                  {m.from}
                  <span className="inline-block w-3 h-3 bg-green-400 rounded-full" title="Online"></span>
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
