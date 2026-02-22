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

  return (
    <section aria-label="Messages panel">
      <h3 className="text-lg font-bold mb-3">Messages</h3>
      <div className="mb-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." className="w-full p-2 border rounded-md" rows={3} />
        <div className="flex justify-end mt-2">
          <button disabled={loading} onClick={sendMessage} className="px-3 py-1 rounded bg-fuchsia-600 text-white disabled:opacity-50">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl shadow p-4 flex items-start gap-3">
            <img src={m.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt={`${m.from} avatar`} className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <div className="flex justify-between items-center">
                <strong>{m.from}</strong>
                <span className="text-xs text-gray-400">{m.time}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{m.preview || m.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
