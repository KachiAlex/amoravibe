"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Msg = {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: string;
  read?: boolean;
  _pending?: boolean;
};

export default function ConversationClient({ otherId }: { otherId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/messages?with=${otherId}&limit=25`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const ms: Msg[] = (data.messages || []).map((m: any) => ({ ...m, createdAt: m.createdAt }));
        // messages come newest-first; reverse for chronological
        setMessages(ms.reverse());
        setNextCursor(data.nextCursor ?? null);
        // mark read
        fetch('/api/messages/read', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ other: otherId }) }).catch(() => {});
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages.length]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoading(true);
    const res = await fetch(`/api/messages?with=${otherId}&cursor=${encodeURIComponent(nextCursor)}&limit=25`);
    const data = await res.json();
    const ms: Msg[] = (data.messages || []).map((m: any) => ({ ...m, createdAt: m.createdAt }));
    // prepend older messages (server returns newest-first)
    setMessages((cur) => [...ms.reverse(), ...cur]);
    setNextCursor(data.nextCursor ?? null);
    setLoading(false);
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const tempId = `tmp-${Date.now()}`;
    const pending: Msg = { id: tempId, fromId: 'me', toId: otherId, text: text.trim(), createdAt: new Date().toISOString(), _pending: true };
    setMessages((m) => [...m, pending]);
    setText('');

    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: otherId, text: pending.text }) });
      if (!res.ok) throw new Error('send failed');
      const body = await res.json();
      const real: Msg = { ...body.message };
      setMessages((cur) => cur.map((it) => (it.id === tempId ? real : it)));
    } catch (err) {
      // mark failed
      setMessages((cur) => cur.map((it) => (it.id === tempId ? { ...it, _pending: false, text: it.text + ' (failed)' } : it)));
    } finally {
      setSending(false);
      // scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <button className="text-sm text-gray-500" onClick={() => router.back()}>Back</button>
        <h3 className="text-lg font-semibold">Conversation</h3>
        <div />
      </div>
      <div className="border rounded-lg p-4 h-[60vh] overflow-auto bg-white/80">
        {nextCursor && (
          <button
            onClick={loadMore}
            className="text-sm text-blue-600 mb-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Load older messages'}
          </button>
        )}
        <div className="space-y-3">
          {loading && (
            <div className="text-xs text-gray-500" role="status" aria-live="polite">
              Loading messages…
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`p-2 rounded-lg ${m.fromId === 'me' ? 'bg-indigo-100 self-end' : 'bg-gray-100'}`}>
              <div className="text-sm text-gray-700">{m.text} {m._pending && <span className="text-xs text-gray-500">(sending…)</span>}</div>
              <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-md px-3 py-2 border" placeholder="Write a message…" />
        <button type="submit" disabled={sending} className="rounded-md bg-blue-600 text-white px-4 py-2">Send</button>
      </form>
    </div>
  );
}
