"use client";
import React, { useState } from "react";
import Image from "next/image";

// Message and Conversation types
export type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  contactName: string;
  contactAvatar?: string;
  messages: Message[];
  unreadCount?: number;
};

// Demo data for UI
const demoConversations: Conversation[] = [
  {
    id: "1",
    contactName: "Sarah Johnson",
    contactAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    unreadCount: 1,
    messages: [
      { id: "m1", from: "Sarah Johnson", to: "You", text: "Hey! Want to grab coffee?", time: "2h" },
      { id: "m2", from: "You", to: "Sarah Johnson", text: "Sure, when?", time: "1h" },
    ],
  },
  {
    id: "2",
    contactName: "Michael Chen",
    contactAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    unreadCount: 0,
    messages: [
      { id: "m3", from: "Michael Chen", to: "You", text: "Photo shoot tomorrow?", time: "3h" },
      { id: "m4", from: "You", to: "Michael Chen", text: "Sounds good!", time: "2h" },
    ],
  },
];

export default function MessagesConversationPanel({ conversations = demoConversations }: { conversations?: Conversation[] }) {
  const [activeId, setActiveId] = useState(conversations[0]?.id || "");
  const [input, setInput] = useState("");

  const activeConv = conversations.find((c) => c.id === activeId);

  function handleSend() {
    if (!input.trim() || !activeConv) return;
    // Optimistic UI: add message
    activeConv.messages.push({
      id: `tmp-${Date.now()}`,
      from: "You",
      to: activeConv.contactName,
      text: input,
      time: "now",
    });
    setInput("");
  }

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <aside className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="px-4 py-3 font-bold text-lg">Conversations</div>
        <ul className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <li
              key={c.id}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-fuchsia-50 ${activeId === c.id ? "bg-fuchsia-100" : ""}`}
              onClick={() => setActiveId(c.id)}
            >
              <Image
                src={c.contactAvatar || '/images/default-avatar.png'}
                alt="avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.contactName}</div>
                <div className="text-xs text-gray-400 truncate">
                  {c.messages[c.messages.length - 1]?.text}
                </div>
              </div>
              {c.unreadCount ? (
                <span className="bg-fuchsia-600 text-white text-xs rounded-full px-2 py-1 ml-2">{c.unreadCount}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </aside>

      {/* Active Conversation */}
      <section className="flex-1 flex flex-col h-full">
        <div className="px-6 py-4 border-b font-bold text-lg flex items-center gap-3">
          {activeConv && (
            <>
              <Image
                src={activeConv.contactAvatar || '/images/default-avatar.png'}
                alt="avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
                unoptimized
              />
              <span>{activeConv.contactName}</span>
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
          {activeConv?.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "You" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs rounded-lg px-4 py-2 ${m.from === "You" ? "bg-fuchsia-100 text-right" : "bg-gray-100 text-left"}`}>
                <div className="text-sm font-semibold mb-1">{m.from}</div>
                <div className="text-base">{m.text}</div>
                <div className="text-xs text-gray-400 mt-1">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded border"
          />
          <button
            onClick={handleSend}
            className="bg-fuchsia-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
