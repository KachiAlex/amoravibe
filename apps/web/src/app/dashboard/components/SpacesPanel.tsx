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
};

type Room = {
  id: string;
  name: string;
  description?: string;
  spaceId: string;
  creatorId: string;
  createdAt: string;
};

export default function SpacesPanel() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [roomFormData, setRoomFormData] = useState({ name: '', description: '' });
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    fetchSpaces();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchSpaces = useCallback(async () => {
    setSpacesLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/spaces");
      const data = await res.json();
      setSpaces(data.spaces || []);
    } catch (err) {
      console.error("Failed to fetch spaces", err);
      setError("Failed to load spaces");
    } finally {
      setSpacesLoading(false);
    }
  }, []);

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

  const handleSelectSpace = useCallback((space: Space) => {
    setSelectedSpace(space);
    setShowCreateRoomForm(false);
    setError(null);
    fetchRooms(space.id);
  }, [fetchRooms]);

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
            <div>
              <h2 className="text-3xl font-bold">{selectedSpace.name}</h2>
              <p className="text-gray-600">{selectedSpace.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedSpace.roomCount} rooms • Limit: {selectedSpace.roomCreationLimit}
            </div>
            {selectedSpace.isMember && (
              <button
                onClick={() => setShowCreateRoomForm(!showCreateRoomForm)}
                className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
              >
                {showCreateRoomForm ? 'Cancel' : '+ Create Room'}
              </button>
            )}
          </div>
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
          {rooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No rooms yet. {selectedSpace.isMember && 'Create one to get started!'}
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                {room.description && <p className="text-gray-600 mb-4">{room.description}</p>}
                <button className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:shadow-lg transition">
                  Enter Room
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-8">Spaces & Communities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition cursor-pointer"
            onClick={() => handleSelectSpace(space)}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl">{space.icon}</span>
              {space.isMember && (
                <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Joined
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">{space.name}</h3>
            <p className="text-gray-600 mb-4">{space.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{space.roomCount} rooms</span>
              <span>Limit: {space.roomCreationLimit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
