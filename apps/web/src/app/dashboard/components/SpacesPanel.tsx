"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";

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
  creator: {
    displayName: string;
  };
  createdAt: Date;
  isGeneral?: boolean;
  members: any[];
};

export default function SpacesPanel() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [roomFormData, setRoomFormData] = useState({ name: '', description: '' });
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'members' | 'events'>('rooms');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'online'>('all');
  const [roomSearch, setRoomSearch] = useState('');
  
  const abortControllerRef = useRef<AbortController>();

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

  useEffect(() => {
    fetchSpaces();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSpaces]);

  const fetchRooms = useCallback(async (spaceId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/spaces/${spaceId}/rooms`, {
        credentials: 'include',
        signal: abortControllerRef.current.signal
      });
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to fetch rooms", err);
        setError("Failed to load rooms");
      }
    } finally {
      setLoading(false);
    }
  }, []);

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
    setSelectedSpace(space);
    setShowCreateRoomForm(false);
    setError(null);
    setActiveTab('rooms');
    fetchRooms(space.id);
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
              onClick={() => setActiveTab('events')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'events'
                  ? 'bg-white text-fuchsia-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Events
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
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-fuchsia-700">
                          {member.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.avatar} alt={member.displayName} className="w-16 h-16 rounded-full object-cover" />
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

        {activeTab === 'events' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Events Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Create and join meetups, virtual hangouts, and community events.
            </p>
            <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition">
              Create Event
            </button>
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
