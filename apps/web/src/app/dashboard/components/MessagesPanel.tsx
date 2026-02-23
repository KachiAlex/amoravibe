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
      <h3 className="text-xl font-bold mb-4">Messages</h3>
      <div className="mb-4 bg-white rounded-xl shadow p-4 flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          className="w-full p-3 border rounded-md focus:outline-fuchsia-500 text-base"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            disabled={loading || !text.trim()}
            onClick={sendMessage}
            className="px-5 py-2 rounded-full bg-fuchsia-600 text-white font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
        {messages.length === 0 && <div className="text-center text-ink-300">No messages yet.</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl shadow p-5 flex items-start gap-4 relative group hover:shadow-lg transition"
          >
            <img
              src={m.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt="avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-fuchsia-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-lg truncate">{m.from}</span>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{m.time}</span>
              </div>
              <div className="text-base text-gray-700 break-words mb-2">{m.preview || m.text}</div>
              <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition">
                <button
                  className="text-xs px-3 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 font-medium"
                  onClick={() => setText(`@${m.from} `)}
                >
                  Reply
                </button>
                <button
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 font-medium"
                  onClick={() => handleDelete(m.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
