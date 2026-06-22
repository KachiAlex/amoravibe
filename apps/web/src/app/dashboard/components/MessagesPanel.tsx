"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Search,
  Pencil,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Mic,
  Send,
  ChevronLeft,
} from "lucide-react";
import type { Message } from "../types";
import { defaultAvatar } from "@/lib/assets";

type ChatMessage = {
  id: string;
  text: string;
  sentByMe: boolean;
  time: string;
  read?: boolean;
};

type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
};

function buildConversations(initial: Message[]): Conversation[] {
  if (initial.length > 0) {
    return initial.map((m, idx) => ({
      id: m.id,
      name: m.from,
      avatar: m.avatar || undefined,
      preview: m.preview || m.text || "Hey! How's it going?",
      time: m.time || "2m ago",
      unread: m.unread ? 1 : 0,
      online: m.online ?? true,
      messages: mockMessagesForUser(m.from, idx),
    }));
  }
  // Fallback demo data
  const names = ["Sarah", "Maya", "Zoe", "Lily", "Emma", "Hannah", "Olivia"];
  return names.map((name, i) => ({
    id: `demo-${i}`,
    name,
    avatar: undefined,
    preview: [
      "Hey! How's your day going?",
      "That concert was amazing!",
      "Let's plan something soon 😊",
      "That hiking spot looks cool!",
      "Love your taste in music 🎵",
      "Haha that's true 😂",
      "See you there!",
    ][i],
    time: ["2m ago", "1h ago", "2h ago", "1d ago", "2d ago", "3d ago", "3d ago"][i],
    unread: i === 0 || i === 2 ? 1 : 0,
    online: true,
    messages: mockMessagesForUser(name, i),
  }));
}

function mockMessagesForUser(name: string, seed: number): ChatMessage[] {
  const chats: ChatMessage[][] = [
    [
      { id: "1", text: "Hey! How's your day going?", sentByMe: false, time: "10:30 AM" },
      { id: "2", text: "Hey Sarah! It's going great, thanks for asking 😊", sentByMe: true, time: "10:32 AM", read: true },
      { id: "3", text: "That's good to hear! Anything fun planned for the weekend?", sentByMe: false, time: "10:33 AM" },
      { id: "4", text: "Not much yet, thinking of checking out that art festival. You?", sentByMe: true, time: "10:35 AM", read: true },
      { id: "5", text: "Ooh that sounds fun! I might go too. Maybe we can go together? 😊", sentByMe: false, time: "10:36 AM" },
      { id: "6", text: "Sure, I'd love that! Let's plan for it then 🎉", sentByMe: true, time: "10:37 AM", read: true },
    ],
    [
      { id: "1", text: "That concert was amazing!", sentByMe: false, time: "9:15 AM" },
      { id: "2", text: "Right?! The energy was unreal 🔥", sentByMe: true, time: "9:20 AM", read: true },
    ],
    [
      { id: "1", text: "Let's plan something soon 😊", sentByMe: false, time: "Yesterday" },
      { id: "2", text: "Definitely! How about this weekend?", sentByMe: true, time: "Yesterday", read: true },
    ],
    [
      { id: "1", text: "That hiking spot looks cool!", sentByMe: false, time: "Yesterday" },
    ],
    [
      { id: "1", text: "Love your taste in music 🎵", sentByMe: false, time: "2d ago" },
      { id: "2", text: "Thanks! We should swap playlists sometime", sentByMe: true, time: "2d ago", read: true },
    ],
    [
      { id: "1", text: "Haha that's true 😂", sentByMe: false, time: "3d ago" },
    ],
    [
      { id: "1", text: "See you there!", sentByMe: false, time: "3d ago" },
      { id: "2", text: "Can't wait! 🙌", sentByMe: true, time: "3d ago", read: true },
    ],
  ];
  return chats[seed % chats.length];
}

type FilterTab = "all" | "unread" | "favorites";

export default function MessagesPanel({ initialMessages = [] }: { initialMessages?: Message[] }): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>(() => buildConversations(initialMessages));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const filtered = useMemo(() => {
    let list = conversations;
    if (filter === "unread") list = list.filter((c) => c.unread > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, filter, search]);

  useEffect(() => {
    if (!initialMessages.length) {
      fetch("/api/messages", { credentials: "same-origin" })
        .then((r) => r.json())
        .then((data) => {
          const arr = Array.isArray(data) ? data : [];
          setConversations(buildConversations(arr));
        })
        .catch(() => setError("Failed to load messages"));
    }
  }, [initialMessages.length]);

  useEffect(() => {
    // SSE for real-time
    const eventSource = new EventSource("/api/messages/stream", { withCredentials: true });
    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === msg.id);
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            preview: msg.text || msg.preview || updated[idx].preview,
            time: msg.time || "Just now",
            unread: updated[idx].id === selectedId ? 0 : updated[idx].unread + 1,
          };
          return updated;
        });
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };
    eventSource.onerror = () => {
      setError("Connection lost. Reconnecting...");
      eventSource.close();
    };
    return () => eventSource.close();
  }, [selectedId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selected?.messages.length]);

  function sendMessage() {
    if (!input.trim() || !selected) return;
    const newMsg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      text: input.trim(),
      sentByMe: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, messages: [...c.messages, newMsg], preview: newMsg.text, time: "Just now" }
          : c
      )
    );
    setInput("");
  }

  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <section aria-label="Messages panel" className="h-full flex flex-col md:flex-row bg-white">
      {/* Conversation List */}
      <div className={`${selected ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-gray-100`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" aria-label="New message">
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-5 mb-3 flex gap-2">
          {(["all", "unread", "favorites"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                filter === tab
                  ? "border-fuchsia-500 text-fuchsia-600 bg-fuchsia-50"
                  : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab === "all" && "All"}
              {tab === "unread" && (
                <span className="flex items-center gap-1">
                  Unread
                  {unreadCount > 0 && (
                    <span className="bg-fuchsia-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              )}
              {tab === "favorites" && "Favorites"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-5 mb-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
            {error}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-12 text-sm">No messages found.</div>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                setConversations((prev) =>
                  prev.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x))
                );
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-left ${
                selectedId === c.id ? "bg-fuchsia-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={c.avatar || defaultAvatar}
                  alt={`${c.name} avatar`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                  unoptimized
                />
                {c.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 text-sm truncate">{c.name}</span>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{c.time}</span>
                </div>
                <p className={`text-sm truncate mt-0.5 ${c.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                  {c.preview}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-fuchsia-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {c.unread > 9 ? "9+" : c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Detail */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
            <button
              className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"
              onClick={() => setSelectedId(null)}
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Image
              src={selected.avatar || defaultAvatar}
              alt={`${selected.name} avatar`}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
              unoptimized
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{selected.name}</div>
              {selected.online && <div className="text-xs text-emerald-500">Online</div>}
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" aria-label="Call">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" aria-label="Video call">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" aria-label="More">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/50">
            <div className="text-center text-xs text-gray-400 my-2">Today</div>
            {selected.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sentByMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sentByMe
                      ? "bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.text}
                  <div className={`text-[10px] mt-1 ${msg.sentByMe ? "text-fuchsia-100" : "text-gray-400"}`}>
                    {msg.time}
                    {msg.sentByMe && msg.read && (
                      <span className="ml-1">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 transition" aria-label="Emoji">
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button className="p-1.5 text-gray-400 hover:text-gray-600 transition" aria-label="Voice">
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={sendMessage}
                className="p-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-full transition"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm">
          Select a conversation to start messaging
        </div>
      )}
    </section>
  );
}
