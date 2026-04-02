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
  edited?: boolean;
  _pending?: boolean;
};

export default function ConversationClient({ otherId }: { otherId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
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
        setMessages(ms.reverse());
        setNextCursor(data.nextCursor ?? null);
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
      setMessages((cur) => cur.map((it) => (it.id === tempId ? { ...it, _pending: false, text: it.text + ' (failed)' } : it)));
    } finally {
      setSending(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function handleDelete(messageId: string) {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setMessages((cur) => cur.filter((m) => m.id !== messageId));
      setMenuOpen(null);
    } catch (err) {
      alert('Failed to delete message');
    }
  }

  async function handleEdit(messageId: string) {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    setEditingId(messageId);
    setEditText(msg.text);
  }

  async function handleSaveEdit(messageId: string) {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (!res.ok) throw new Error('edit failed');
      const data = await res.json();
      setMessages((cur) => cur.map((m) => (m.id === messageId ? { ...m, text: data.message.text, edited: true } : m)));
      setEditingId(null);
      setEditText('');
      setMenuOpen(null);
    } catch (err) {
      alert('Failed to edit message');
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
            <div key={m.id} className={`flex ${m.fromId === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                onMouseEnter={() => setMenuOpen(m.id)}
                onMouseLeave={() => setMenuOpen(null)}
                className="group relative max-w-xs"
              >
                {editingId === m.id ? (
                  <div className="rounded-lg bg-blue-50 p-2 border border-blue-200">
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 rounded border text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveEdit(m.id)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`p-2 rounded-lg ${m.fromId === 'me' ? 'bg-purple-100 text-purple-900' : 'bg-gray-100 text-gray-900'}`}>
                      <div className="text-sm">{m.text}</div>
                      {m._pending && <span className="text-xs text-gray-500">(sending…)</span>}
                      {m.edited && <span className="text-xs text-gray-500 ml-2">(edited)</span>}
                      <div className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                    </div>
                    {m.fromId === 'me' && (menuOpen === m.id) && (
                      <div className="absolute right-0 top-0 translate-y-[-100%] flex gap-1 bg-white rounded shadow-md p-1 z-10 border border-gray-200">
                        <button
                          onClick={() => handleEdit(m.id)}
                          className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit message"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete message"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
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
