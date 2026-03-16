"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  memberCount?: number;
  onlineCount?: number;
};

type Member = {
  id: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
  isOnline?: boolean;
  lastActive?: string;
  compatibilityScore?: number;
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
  isGeneral?: boolean;
};

type RoomMessage = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  // local-only fields for optimistic UI
  localId?: string;
  status?: 'pending' | 'failed' | 'sent';
};

export default function SpacesPanel() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [generalRoom, setGeneralRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [roomFormData, setRoomFormData] = useState({ name: '', description: '' });
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'members' | 'events' | 'chat'>('rooms');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'online'>('all');
  const [roomSearch, setRoomSearch] = useState('');
  const [generalMessages, setGeneralMessages] = useState<RoomMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatViewportRef = useRef<HTMLDivElement | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSpaces = useCallback(async () => {
    setSpacesLoading(true);
    setError(null);
    try {
      console.log('[SpacesPanel] Fetching spaces...');
      const res = await fetch("/api/spaces");
      console.log('[SpacesPanel] Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('[SpacesPanel] API error:', errorData);
        setError(errorData.error || `Failed to load spaces (${res.status})`);
        setSpaces([]);
        return;
      }
      
      const data = await res.json();
      console.log('[SpacesPanel] Received data:', data);
      setSpaces(data.spaces || []);
    } catch (err) {
      console.error("[SpacesPanel] Failed to fetch spaces", err);
      setError("Failed to load spaces. Please try again.");
    } finally {
      setSpacesLoading(false);
    }
  }, []);

  // Fetch spaces on component mount
  useEffect(() => {
    fetchSpaces();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSpaces]);

  // Reset chat when switching spaces
  useEffect(() => {
    setGeneralMessages([]);
    setChatInput('');
    setGeneralRoom(null);
    setChatError(null);
  }, [selectedSpace]);

  const fetchRooms = useCallback(async (spaceId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/spaces/${spaceId}/rooms`, {
        credentials: 'include',
        signal: abortControllerRef.current.signal
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch rooms: ${res.status}`);
      }
      
      const data = await res.json();
      const fetchedRooms: Room[] = data.rooms || [];
      
      if (fetchedRooms.length === 0) {
        console.warn('[SpacesPanel] No rooms returned from API for space', spaceId);
        setError('No rooms found. Please try refreshing.');
      }
      
      setRooms(fetchedRooms);
      const general = fetchedRooms.find((room) => room.isGeneral);
      
      if (general) {
        setGeneralRoom(general);
        console.log('[SpacesPanel] General room found:', general.name);
      } else {
        console.warn('[SpacesPanel] No general room found in rooms list');
        setGeneralRoom(null);
        setError('General room not available. Please refresh.');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error("[SpacesPanel] Failed to fetch rooms:", errorMsg);
        setError(`Failed to load rooms: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper: Deduplicate and merge messages intelligently
  const smartMergeMessages = useCallback((optimistic: RoomMessage[], serverMessages: RoomMessage[]) => {
    const serverIds = new Set(serverMessages.map(m => m.id));
    // Keep optimistic messages that don't have server equivalents, then add all server messages
    const optimisticNotOnServer = optimistic.filter(m => !serverIds.has(m.id) && m.status === 'failed');
    return [...optimisticNotOnServer, ...serverMessages];
  }, []);

  const fetchGeneralMessages = useCallback(async (roomId: string, silent = false, mergeWithOptimistic = false) => {
    if (!roomId) return;
    if (!silent) setChatLoading(true);
    setConnectionStatus('syncing');
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load chat');
      }
      const data = await res.json();
      const serverMessages = data.messages || [];
      
      // Smart merge: keep failed optimistic messages, add server messages
      if (mergeWithOptimistic) {
        setGeneralMessages(prev => smartMergeMessages(prev, serverMessages));
      } else {
        setGeneralMessages(serverMessages);
      }
      
      setChatError(null);
      setConnectionStatus('connected');
      setLastSyncTime(Date.now());
    } catch (err) {
      console.error('[SpacesPanel] Failed to fetch general chat', err);
      setChatError('Failed to load chat messages. Please try again.');
      setConnectionStatus('disconnected');
    } finally {
      if (!silent) setChatLoading(false);
    }
  }, [smartMergeMessages]);

  const handleSendGeneralMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SpacesPanel] Send button clicked, chatInput:', chatInput);
    console.log('[SpacesPanel] generalRoom:', generalRoom?.id);
    if (!generalRoom || !chatInput.trim()) {
      console.log('[SpacesPanel] Early return - no room or empty input');
      return;
    }

    setSendingMessage(true);
    // create a temporary local message for optimistic UI
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tempMsg: RoomMessage = {
      id: tempId,
      localId: tempId,
      text: chatInput,
      createdAt: new Date().toISOString(),
      user: { id: 'me', displayName: 'You' },
      status: 'pending',
    };

    // append optimistically and clear input
    const messageText = chatInput;
    setGeneralMessages((prev) => [...prev, tempMsg]);
    setChatInput('');
    setConnectionStatus('syncing');

    try {
      const res = await fetch(`/api/rooms/${generalRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: messageText }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[SpacesPanel] Send failed with status', res.status, ':', errorData);
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Smart reconciliation: merge new server message into optimistic
      const newMessage = await res.json();
      console.log('[SpacesPanel] Message sent successfully:', newMessage);
      setGeneralMessages((prev) => 
        prev.map((m) => m.localId === tempId ? { ...newMessage, status: 'sent' } : m)
      );
      setConnectionStatus('connected');
      setLastSyncTime(Date.now());
      setChatError(null);
    } catch (err) {
      console.error('[SpacesPanel] Failed to send chat message', err);
      setChatError('Unable to send message. You can retry.');
      // mark the optimistic message as failed
      setGeneralMessages((prev) => prev.map((m) => (m.localId === tempId ? { ...m, status: 'failed' } : m)));
      setConnectionStatus('disconnected');
    } finally {
      setSendingMessage(false);
    }
  }, [generalRoom]);

  const handleRetryMessage = useCallback(async (localId?: string) => {
    if (!generalRoom || !localId) return;

    // Get message from current state rather than closure
    let msg: RoomMessage | undefined;
    setGeneralMessages((prev) => {
      msg = prev.find((m) => m.localId === localId || m.id === localId);
      return prev.map((m) => (m.localId === localId ? { ...m, status: 'pending' } : m));
    });
    
    if (!msg) return;
    setConnectionStatus('syncing');

    try {
      const res = await fetch(`/api/rooms/${generalRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: msg.text }),
      });
      if (!res.ok) throw new Error('retry failed');
      
      // Smart merge: update optimistic with server response
      const newMessage = await res.json();
      setGeneralMessages((prev) => 
        prev.map((m) => m.localId === localId ? { ...newMessage, status: 'sent' } : m)
      );
      setConnectionStatus('connected');
      setLastSyncTime(Date.now());
    } catch (err) {
      console.error('[SpacesPanel] Retry failed', err);
      setGeneralMessages((prev) => prev.map((m) => (m.localId === localId ? { ...m, status: 'failed' } : m)));
      setConnectionStatus('disconnected');
    }
  }, [generalRoom]);

  const fetchMembers = useCallback(async (spaceId: string) => {
    try {
      const res = await fetch(`/api/spaces/${spaceId}/members`, {
        credentials: 'include',
      });
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  }, []);

  const handleSelectSpace = useCallback((space: Space) => {
    console.log('[SpacesPanel] Selecting space:', space.name);
    setSelectedSpace(space);
    setShowCreateRoomForm(false);
    setError(null);
    setGeneralMessages([]);
    setChatError(null);
    setActiveTab('rooms'); // Start with rooms tab to show loading
    
    // Fetch rooms (which will trigger ensureGeneralRoom on backend)
    fetchRooms(space.id).then(() => {
      // Once rooms are fetched, switch to chat tab
      setTimeout(() => setActiveTab('chat'), 200);
    });
    
    fetchMembers(space.id);
  }, [fetchRooms, fetchMembers]);

  const filteredRooms = React.useMemo(() => {
    if (!roomSearch.trim()) return rooms;
    
    const search = roomSearch.toLowerCase();
    return rooms.filter(r => 
      r.name.toLowerCase().includes(search) ||
      r.description?.toLowerCase().includes(search)
    );
  }, [rooms, roomSearch]);

  const breakoutRooms = React.useMemo(() => rooms.filter((room) => !room.isGeneral), [rooms]);

  // Memoize SSE callbacks to prevent hook dependency issues
  const handleSSEMessage = useCallback((message: any, isInitial: boolean) => {
    // Skip initial catch-up messages if we already have them
    if (isInitial) return;
    
    setGeneralMessages(prev => {
      // Create Set of server message IDs to filter out duplicates
      const serverIds = new Set(prev.filter(m => !m.localId).map(m => m.id));
      
      // If message already exists, skip it
      if (serverIds.has(message.id)) return prev;
      
      // Add new message
      return [...prev, { ...message, status: 'sent' }];
    });
    
    // Use setTimeout to batch state updates
    setTimeout(() => {
      setConnectionStatus('connected');
      setLastSyncTime(Date.now());
    }, 0);
  }, []);

  const handleSSEConnected = useCallback(() => {
    setConnectionStatus('connected');
    console.log('[SSE] Room stream connected');
  }, []);

  const handleSSEError = useCallback((error: Error) => {
    console.error('[SSE] Stream error:', error);
    setConnectionStatus('disconnected');
    // Polling fallback will handle reconnection
  }, []);

  // Set up SSE for real-time messages with polling fallback
  const sseStatus = useRoomMessagesStream({
    roomId: generalRoom?.id || '',
    lastSync: new Date(lastSyncTime),
    enabled: !!generalRoom?.id && activeTab === 'chat',
    onMessage: handleSSEMessage,
    onConnected: handleSSEConnected,
    onError: handleSSEError,
  });

  useEffect(() => {
    if (!generalRoom?.id || activeTab !== 'chat') return;
    fetchGeneralMessages(generalRoom.id);
    // Polling as fallback: use smart merge instead of full refetch (reduced data transfer)
    // With SSE enabled, this runs less frequently (30s instead of 15s) to sync state
    const refreshInterval = setInterval(() => fetchGeneralMessages(generalRoom.id, true, true), 30000);
    return () => clearInterval(refreshInterval);
  }, [generalRoom?.id, activeTab, fetchGeneralMessages]);

  useEffect(() => {
    if (!chatViewportRef.current) return;
    chatViewportRef.current.scrollTop = chatViewportRef.current.scrollHeight;
  }, [generalMessages]);

  const filteredMembers = React.useMemo(() => {
    let filtered = members;
    
    if (memberFilter === 'online') {
      filtered = filtered.filter(m => m.isOnline);
    }
    
    if (memberSearch.trim()) {
      const search = memberSearch.toLowerCase();
      filtered = filtered.filter(m => 
        m.displayName.toLowerCase().includes(search) ||
        m.bio?.toLowerCase().includes(search) ||
        m.interests?.some(i => i.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }, [members, memberFilter, memberSearch]);

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSpace || !roomFormData.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          spaceId: selectedSpace.id,
          name: roomFormData.name,
          description: roomFormData.description,
        }),
      });

      if (res.ok) {
        setRoomFormData({ name: '', description: '' });
        setShowCreateRoomForm(false);
        fetchRooms(selectedSpace.id);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create room");
      }
    } catch (err) {
      console.error("Failed to create room", err);
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  if (selectedSpace) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <button
          onClick={() => setSelectedSpace(null)}
          className="mb-6 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          ← Back to Spaces
        </button>

        <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{selectedSpace.icon}</span>
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{selectedSpace.name}</h2>
              <p className="text-gray-600">{selectedSpace.description}</p>
            </div>
            {selectedSpace.isMember && (
              <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                Member
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span><strong>{selectedSpace.roomCount || 0}</strong> rooms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span><strong>{selectedSpace.memberCount || 0}</strong> members</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span><strong>{selectedSpace.onlineCount || 0}</strong> online</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'rooms'
                  ? 'bg-white text-fuchsia-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏠 Rooms
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'members'
                  ? 'bg-white text-fuchsia-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Members
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'chat'
                  ? 'bg-white text-fuchsia-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💬 Chat
            </button>
          </div>
        </div>

        {activeTab === 'rooms' && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  placeholder="Search rooms..."
                  className="w-full rounded-full border-2 border-gray-200 px-4 py-2 focus:border-fuchsia-500 focus:outline-none"
                />
              </div>
              {selectedSpace.isMember && (
                <button
                  onClick={() => setShowCreateRoomForm(!showCreateRoomForm)}
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition text-sm whitespace-nowrap"
                >
                  {showCreateRoomForm ? 'Cancel' : '+ Create Room'}
                </button>
              )}
            </div>

            {showCreateRoomForm && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Create New Room</h3>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Name</label>
                    <input
                      type="text"
                      value={roomFormData.name}
                      onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                      placeholder="e.g., General Discussion"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-fuchsia-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={roomFormData.description}
                      onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                      placeholder="What is this room for?"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-fuchsia-500 focus:outline-none"
                      rows={2}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
                  >
                    {loading ? 'Creating...' : 'Create Room'}
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRooms.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {roomSearch ? 'No rooms found matching your search.' : 'No rooms yet.'} {!roomSearch && selectedSpace.isMember && 'Create one to get started!'}
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold flex-1">{room.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {room.description && <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>}
                    <button className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:shadow-lg transition group-hover:scale-105">
                      Enter Room
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name, bio, or interests..."
                  className="w-full rounded-full border-2 border-gray-200 px-4 py-2 focus:border-fuchsia-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1 border border-gray-200">
                <button
                  onClick={() => setMemberFilter('all')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    memberFilter === 'all'
                      ? 'bg-white text-fuchsia-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setMemberFilter('online')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    memberFilter === 'online'
                      ? 'bg-white text-fuchsia-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Online
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {memberSearch ? 'No members found matching your search.' : 'No members yet.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-fuchsia-700 overflow-hidden">
                          {member.avatar ? (
                            <Image
                              src={member.avatar}
                              alt={member.displayName}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-full object-cover"
                              loading="lazy"
                              unoptimized
                            />
                          ) : (
                            member.displayName[0].toUpperCase()
                          )}
                        </div>
                        {member.isOnline && (
                          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">{member.displayName}</h3>
                        {member.compatibilityScore !== undefined && (
                          <div className="text-xs font-semibold text-fuchsia-600">
                            {member.compatibilityScore}% Match
                          </div>
                        )}
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{member.bio}</p>
                    )}
                    {member.interests && member.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {member.interests.slice(0, 3).map((interest, idx) => (
                          <span key={idx} className="text-xs bg-gradient-to-r from-fuchsia-50 to-purple-50 text-fuchsia-700 px-2 py-1 rounded-full border border-fuchsia-100">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow hover:shadow-lg transition">
                        View Profile
                      </button>
                      <button className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm font-semibold">
                        💬
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'chat' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(220px,1fr)]">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-4 md:p-6 flex flex-col min-h-[480px]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">General Chat</p>
                  <h3 className="text-xl font-bold text-gray-900">{generalRoom?.name || 'Community Hangout'}</h3>
                  <p className="text-sm text-gray-500">Everyone in this space hangs out here.</p>
                </div>
                {generalRoom && (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-emerald-500' : 
                      connectionStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {connectionStatus === 'connected' ? 'Live' : 
                       connectionStatus === 'syncing' ? 'Syncing…' : 'Offline'}
                    </span>
                    {lastSyncTime && (
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        Last sync: {Math.round((Date.now() - lastSyncTime) / 1000)}s ago
                      </span>
                    )}
                  </div>
                )}
              </div>

              {chatError && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {chatError}
                </div>
              )}

              {error && !generalRoom && (
                <div className="mb-3 text-sm text-orange-600 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              {!generalRoom ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 gap-4">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">General room not initialized</p>
                    <p className="text-xs">The general chat room will be created when you refresh.</p>
                  </div>
                  <button
                    onClick={() => selectedSpace && fetchRooms(selectedSpace.id)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold rounded-full bg-fuchsia-500 text-white hover:bg-fuchsia-600 disabled:opacity-60 transition"
                  >
                    {loading ? 'Refreshing...' : 'Refresh Rooms'}
                  </button>
                </div>
              ) : (
                <>
                  <div
                    ref={chatViewportRef}
                    className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/60 to-white px-3 py-4 space-y-4"
                  >
                    {chatLoading && generalMessages.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">Loading conversation…</div>
                    ) : generalMessages.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">No messages yet. Say hi to everyone!</div>
                    ) : (
                      generalMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-3 items-start">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-sm font-bold text-fuchsia-700 overflow-hidden flex-shrink-0">
                            {msg.user.avatar ? (
                              <Image
                                src={msg.user.avatar}
                                alt={msg.user.displayName}
                                width={40}
                                height={40}
                                className="h-10 w-10 object-cover"
                                loading="lazy"
                                unoptimized
                              />
                            ) : (
                              msg.user.displayName[0]?.toUpperCase()
                            )}
                          </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-semibold text-gray-900">{msg.user.displayName}</span>
                                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  {msg.status === 'pending' && (
                                    <span className="text-xs text-gray-400 italic"> • Sending…</span>
                                  )}
                                  {msg.status === 'failed' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRetryMessage(msg.localId || msg.id)}
                                      className="ml-2 text-xs text-red-600 font-semibold"
                                    >
                                      Retry
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed">{msg.text}</p>
                              </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendGeneralMessage} className="mt-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Share an update with everyone…"
                        className="flex-1 rounded-2xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-fuchsia-500 focus:outline-none"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-5 py-3 font-semibold disabled:opacity-60"
                        disabled={sendingMessage || !chatInput.trim()}
                      >
                        {sendingMessage ? 'Sending…' : 'Send'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-right">Messages are visible to all members of this space.</p>
                  </form>
                </>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Breakout rooms</p>
                  <h4 className="text-lg font-bold text-gray-900">Focused conversations</h4>
                </div>
                {selectedSpace?.isMember && (
                  <button
                    onClick={() => {
                      setActiveTab('rooms');
                      setShowCreateRoomForm(true);
                    }}
                    className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-800"
                  >
                    + Create
                  </button>
                )}
              </div>

              {breakoutRooms.length === 0 ? (
                <p className="text-sm text-gray-500">No breakout rooms yet. Spin one up for deep dives.</p>
              ) : (
                <div className="space-y-3">
                  {breakoutRooms.slice(0, 4).map((room) => (
                    <div key={room.id} className="border border-gray-100 rounded-2xl px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{room.name}</p>
                      {room.description && <p className="text-xs text-gray-500 line-clamp-2">{room.description}</p>}
                      <button className="mt-3 w-full rounded-full border border-fuchsia-100 text-fuchsia-600 text-sm font-semibold py-2 hover:bg-fuchsia-50 transition">
                        Enter room
                      </button>
                    </div>
                  ))}
                  {breakoutRooms.length > 4 && (
                    <button
                      onClick={() => setActiveTab('rooms')}
                      className="w-full text-xs font-semibold text-gray-500 hover:text-gray-700"
                    >
                      View all rooms
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Spaces & Communities</h2>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm md:text-base">{error}</div>}

      {spacesLoading && spaces.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading spaces…</div>
      ) : null}

      {!spacesLoading && spaces.length === 0 && !error ? (
        <div className="text-center py-12">
          <div className="text-5xl md:text-6xl mb-4">🌈</div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No Spaces Available</h3>
          <p className="text-gray-600 text-sm md:text-base">Spaces will appear here once they are created.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition cursor-pointer group"
            onClick={() => handleSelectSpace(space)}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl md:text-5xl group-hover:scale-110 transition">{space.icon}</span>
              {space.isMember && (
                <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  Member
                </span>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">{space.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2 text-sm md:text-base">{space.description}</p>
            
            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-base md:text-lg">🏠</span>
                <span><strong>{space.roomCount || 0}</strong> rooms</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base md:text-lg">👥</span>
                <span><strong>{space.memberCount || 0}</strong> members</span>
              </div>
            </div>
            
            {space.onlineCount !== undefined && space.onlineCount > 0 && (
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-600 font-semibold">{space.onlineCount} online now</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
