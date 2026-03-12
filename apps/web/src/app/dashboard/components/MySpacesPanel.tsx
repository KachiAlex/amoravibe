"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRoomMessagesStream } from "@/hooks/useRoomMessagesStream";

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
  localId?: string;
  status?: 'pending' | 'failed' | 'sent';
};

export default function MySpacesPanel() {
  const [joinedSpaces, setJoinedSpaces] = useState<Space[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  useEffect(() => {
    fetchJoinedSpaces();
  }, []);

  // Set up SSE for real-time messages with polling fallback
  const sseStatus = useRoomMessagesStream({
    roomId: selectedRoom?.id || '',
    lastSync: new Date(lastSyncTime),
    enabled: !!selectedRoom?.id,
    onMessage: (message, isInitial) => {
      // Skip initial catch-up messages if we already have them
      if (isInitial) return;
      
      setMessages(prev => {
        // Create Set of server message IDs to filter out duplicates
        const serverIds = new Set(prev.filter(m => !m.localId).map(m => m.id));
        
        // If message already exists, skip it
        if (serverIds.has(message.id)) return prev;
        
        // Add new message
        return [...prev, { ...message, status: 'sent' }];
      });
      
      setConnectionStatus('connected');
      setLastSyncTime(Date.now());
    },
    onConnected: () => {
      setConnectionStatus('connected');
      console.log('[SSE] Room stream connected');
    },
    onError: (error) => {
      console.error('[SSE] Stream error:', error);
      setConnectionStatus('disconnected');
      // Polling fallback will handle reconnection
    },
  });

  // Initial load and polling fallback
  useEffect(() => {
    if (!selectedRoom?.id) return;
    fetchRoomMessages(selectedRoom.id);
    // Polling as fallback: use smart merge instead of full refetch (reduced data transfer)
    // With SSE enabled, this runs less frequently (30s instead of 15s) to sync state
    const refreshInterval = setInterval(() => fetchRoomMessages(selectedRoom.id, true), 30000);
    return () => clearInterval(refreshInterval);
  }, [selectedRoom?.id]);

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

  // Helper: Deduplicate and merge messages
  const smartMergeMessages = (optimistic: Message[], serverMessages: Message[]) => {
    const serverIds = new Set(serverMessages.map(m => m.id));
    const optimisticNotOnServer = optimistic.filter(m => !serverIds.has(m.id) && m.status === 'failed');
    return [...optimisticNotOnServer, ...serverMessages];
  };

  async function fetchRoomMessages(roomId: string, mergeWithOptimistic = false) {
    try {
      setConnectionStatus('syncing');
      const res = await fetch(`/api/rooms/${roomId}/messages`);
      const data = await res.json();
      const serverMessages = data.messages || [];
      
      if (mergeWithOptimistic) {
        setMessages(prev => smartMergeMessages(prev, serverMessages));
      } else {
        setMessages(serverMessages);
      }
      setConnectionStatus('connected');
      setLastSyncTime(Date.now());
    } catch (err) {
      console.error("Failed to fetch messages", err);
      setConnectionStatus('disconnected');
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom || !messageText.trim()) return;

    const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const msgText = messageText;
    
    // Append optimistic message
    const optimisticMsg: Message = {
      id: localId,
      text: msgText,
      user: {
        id: 'current-user',
        displayName: 'You',
        avatar: undefined,
      },
      createdAt: new Date().toISOString(),
      localId,
      status: 'pending',
    };
    setMessages([...messages, optimisticMsg]);
    setMessageText('');
    setChatError(null);
    setConnectionStatus('syncing');

    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: msgText }),
      });

      if (res.ok) {
        // Smart merge: update optimistic with server response
        const newMessage = await res.json();
        setMessages((prev) => 
          prev.map((m) => m.localId === localId ? { ...newMessage, status: 'sent' } : m)
        );
        setConnectionStatus('connected');
        setLastSyncTime(Date.now());
      } else {
        // Mark optimistic message as failed
        setMessages((msgs) =>
          msgs.map((msg) =>
            msg.localId === localId ? { ...msg, status: 'failed' } : msg
          )
        );
        const errorData = await res.json();
        setChatError(errorData.error || 'Failed to send message');
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('[MySpacesPanel] Failed to send message', err);
      setMessages((msgs) =>
        msgs.map((msg) =>
          msg.localId === localId ? { ...msg, status: 'failed' } : msg
        )
      );
      setChatError('Failed to send message. Please try again.');
      setConnectionStatus('disconnected');
    }
  }

  async function handleRetryMessage(localId: string) {
    const msg = messages.find((m) => m.localId === localId);
    if (!msg || !selectedRoom) return;

    // Mark as pending
    setMessages((msgs) =>
      msgs.map((m) => (m.localId === localId ? { ...m, status: 'pending' } : m))
    );
    setChatError(null);
    setConnectionStatus('syncing');

    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: msg.text }),
      });

      if (res.ok) {
        // Smart merge: update optimistic with server response
        const newMessage = await res.json();
        setMessages((prev) => 
          prev.map((m) => m.localId === localId ? { ...newMessage, status: 'sent' } : m)
        );
        setConnectionStatus('connected');
        setLastSyncTime(Date.now());
      } else {
        setMessages((msgs) =>
          msgs.map((m) =>
            m.localId === localId ? { ...m, status: 'failed' } : m
          )
        );
        const errorData = await res.json();
        setChatError(errorData.error || 'Retry failed');
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('[MySpacesPanel] Retry failed', err);
      setMessages((msgs) =>
        msgs.map((m) =>
          m.localId === localId ? { ...m, status: 'failed' } : m
        )
      );
      setChatError('Retry failed. Please try again.');
      setConnectionStatus('disconnected');
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold">{selectedRoom.name}</h2>
              <p className="text-gray-600">{selectedRoom.description}</p>
              <p className="text-sm text-gray-500 mt-2">Created by {selectedRoom.creatorName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-500' : 
                connectionStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'syncing' ? 'Syncing…' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 mb-6 overflow-y-auto border border-gray-100">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id || msg.localId} className="flex gap-3">
                  <Image
                    src={msg.user.avatar || "https://via.placeholder.com/40"}
                    alt={msg.user.displayName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    unoptimized
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{msg.user.displayName}</p>
                    <p className="text-gray-700">{msg.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {msg.status === 'pending'
                          ? 'Sending…'
                          : new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                      {msg.status === 'failed' && (
                        <button
                          onClick={() => handleRetryMessage(msg.localId!)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-2">
          {chatError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {chatError}
            </div>
          )}
          <div className="flex gap-2">
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
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-8">My Spaces</h2>

      {joinedSpaces.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          You haven&apos;t joined any spaces yet. Go to the Spaces tab to join!
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
