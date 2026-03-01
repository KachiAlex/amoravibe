"use client";
import React, { useEffect, useState } from "react";

type Space = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  orientation: string;
  roomCount: number;
  roomCreationLimit: number;
  isMember: boolean;
};

type Room = {
  id: string;
  name: string;
  description?: string;
  spaceId: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  isMember: boolean;
};

type Message = {
  id: string;
  text: string;
  user: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  createdAt: string;
};

export default function MySpacesPanel() {
  const [joinedSpaces, setJoinedSpaces] = useState<Space[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJoinedSpaces();
  }, []);

  async function fetchJoinedSpaces() {
    try {
      const res = await fetch("/api/spaces");
      const data = await res.json();
      const spaces = (data.spaces || []).filter((s: Space) => s.isMember);
      setJoinedSpaces(spaces);
    } catch (err) {
      console.error("Failed to fetch joined spaces", err);
    }
  }

  async function fetchRoomMessages(roomId: string) {
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom || !messageText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: messageText }),
      });

      if (res.ok) {
        setMessageText("");
        fetchRoomMessages(selectedRoom.id);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  }

  if (selectedRoom) {
    return (
      <div className="max-w-4xl mx-auto py-10 h-screen flex flex-col">
        <button
          onClick={() => setSelectedRoom(null)}
          className="mb-6 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          ← Back to My Spaces
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold">{selectedRoom.name}</h2>
          <p className="text-gray-600">{selectedRoom.description}</p>
          <p className="text-sm text-gray-500 mt-2">Created by {selectedRoom.creatorName}</p>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 mb-6 overflow-y-auto border border-gray-100">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <img
                    src={msg.user.avatar || "https://via.placeholder.com/40"}
                    alt={msg.user.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{msg.user.displayName}</p>
                    <p className="text-gray-700">{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full px-4 py-3 border border-gray-200 focus:border-fuchsia-500 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !messageText.trim()}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-8">My Spaces</h2>

      {joinedSpaces.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          You haven't joined any spaces yet. Go to the Spaces tab to join!
        </div>
      ) : (
        <div className="space-y-8">
          {joinedSpaces.map((space) => (
            <div key={space.id} className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{space.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold">{space.name}</h3>
                  <p className="text-gray-600">{space.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rooms will be fetched and displayed here */}
                <div className="text-center py-8 text-gray-500 col-span-full">
                  Loading rooms...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
