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

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h2 className="text-xl font-bold mb-4">Conversation</h2>
      <div ref={listRef} className="bg-white rounded-xl shadow p-4 mb-4 h-96 overflow-y-auto flex flex-col">
        {loading && <div className="text-gray-400 text-sm">Loading…</div>}
        {nextCursor && !loading && (
          <button className="mb-2 text-xs text-blue-500 underline" onClick={loadMore}>Load older messages</button>
        )}
        {messages.map(m => (
          <div key={m.id} className={"mb-2 flex " + (m.fromId === "me" ? "justify-end" : "justify-start")}>
            <div className={"px-3 py-2 rounded-lg flex items-center gap-2 " + (m.fromId === "me" ? "bg-purple-100 text-purple-900" : "bg-gray-100 text-gray-900") + (m.optimistic ? " opacity-60" : "")}>{m.text}
              {m.fromId === "me" && !m.optimistic && (
                <span className="ml-2 text-xs text-gray-500">
                  {m.read ? <span title="Read">✓✓</span> : <span title="Delivered">✓</span>}
                </span>
              )}
            </div>
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
