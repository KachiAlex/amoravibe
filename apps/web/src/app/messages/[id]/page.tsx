"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

function fetchMessages(otherId, cursor = null, limit = 25) {
  const url = `/api/messages?with=${otherId}&limit=${limit}` + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "");
  return fetch(url).then(r => r.json());
}

export default function ConversationPage() {
  const { id: otherId } = useParams();
  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!otherId) return;
    setLoading(true);
    fetchMessages(otherId).then(({ messages, nextCursor }) => {
      setMessages(messages.reverse()); // oldest first
      setNextCursor(nextCursor);
      setLoading(false);
    });
    // SSE subscription for new messages
    const evtSource = new EventSource(`/api/messages/stream?with=${otherId}`);
    evtSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };
    return () => { evtSource.close(); };
  }, [otherId]);

  function loadMore() {
    if (!nextCursor) return;
    setLoading(true);
    fetchMessages(otherId, nextCursor).then(({ messages, nextCursor: nc }) => {
      setMessages(prev => [...messages.reverse(), ...prev]);
      setNextCursor(nc);
      setLoading(false);
    });
  }

  function sendMessage() {
    if (!input.trim()) return;
    setSending(true);
    const tempId = "temp-" + Date.now();
    setMessages(prev => [...prev, { id: tempId, text: input, fromId: "me", toId: otherId, createdAt: new Date().toISOString(), optimistic: true }]);
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: otherId, text: input })
    })
      .then(r => r.json())
      .then(({ message }) => {
        setMessages(prev => prev.map(m => m.id === tempId ? message : m));
      })
      .finally(() => {
        setSending(false);
        setInput("");
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
  }

  async function handleDelete(msgId) {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setMenuOpen(null);
    } catch (err) {
      alert('Failed to delete message');
    }
  }

  async function handleEdit(msgId) {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    setEditingId(msgId);
    setEditText(msg.text);
  }

  async function handleSaveEdit(msgId) {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (!res.ok) throw new Error('edit failed');
      const data = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, text: data.message.text, edited: true } : m)));
      setEditingId(null);
      setEditText('');
      setMenuOpen(null);
    } catch (err) {
      alert('Failed to edit message');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h2 className="text-xl font-bold mb-4">Conversation</h2>
      <div ref={listRef} className="bg-white rounded-xl shadow p-4 mb-4 h-96 overflow-y-auto flex flex-col">
        {loading && <div className="text-gray-400 text-sm">Loading…</div>}
        {nextCursor && !loading && (
          <button className="mb-2 text-xs text-blue-500 underline" onClick={loadMore}>Load older messages</button>
        )}
        {messages.map(m => (
          <div
            key={m.id}
            className="mb-2 flex"
            onMouseEnter={() => setMenuOpen(m.id)}
            onMouseLeave={() => setMenuOpen(null)}
          >
            {editingId === m.id ? (
              <div className="flex-1 max-w-md rounded-lg bg-blue-50 p-2 border border-blue-200">
                <textarea
                  autoFocus
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full p-2 rounded border text-sm"
                  rows={2}
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
              <div className={`flex gap-2 ${m.fromId === "me" ? "justify-end flex-1" : ""}`}>
                <div className={"px-3 py-2 rounded-lg flex items-center gap-2 max-w-md " + (m.fromId === "me" ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900" : "bg-gray-100 text-gray-900") + (m.optimistic ? " opacity-60" : "")}>
                  <div>
                    <div>{m.text}</div>
                    {m.edited && <span className="text-xs text-gray-500">(edited)</span>}
                  </div>
                  {m.fromId === "me" && !m.optimistic && (
                    <span className="ml-2 text-xs text-gray-500">
                      {m.read ? <span title="Read">✓✓</span> : <span title="Delivered">✓</span>}
                    </span>
                  )}
                </div>
                {m.fromId === "me" && menuOpen === m.id && !m.optimistic && (
                  <div className="flex gap-1 bg-white rounded shadow-md px-1 border border-gray-200 h-fit">
                    <button
                      onClick={() => handleEdit(m.id)}
                      className="text-sm px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit message"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete message"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && !loading && <div className="text-gray-400 text-sm">No messages yet</div>}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 rounded-lg border px-3 py-2" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message…" disabled={sending} />
        <button className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white font-semibold" disabled={sending || !input.trim()} onClick={sendMessage}>Send</button>
      </div>
    </main>
  );
}
