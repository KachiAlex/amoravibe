import React, { useEffect, useState } from "react";

type Space = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
};

export default function SpacesPanel() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '🎯' });

  useEffect(() => {
    async function fetchSpaces() {
      const res = await fetch("/api/spaces");
      const data = await res.json();
      setSpaces(data.spaces || []);
    }
    async function fetchMemberships() {
      const res = await fetch("/api/spaces/mine");
      const data = await res.json();
      setJoined((data.memberships || []).map((m: any) => m.space.id));
    }
    fetchSpaces();
    fetchMemberships();
  }, []);

  async function toggleSpace(id: string) {
    setLoading(true);
    if (joined.includes(id)) {
      await fetch(`/api/spaces/${id}/leave`, { method: "POST" });
      setJoined((prev) => prev.filter((s) => s !== id));
    } else {
      await fetch(`/api/spaces/${id}/join`, { method: "POST", body: JSON.stringify({ visibility: "public" }) });
      setJoined((prev) => [...prev, id]);
    }
    setLoading(false);
  }

  async function handleCreateSpace(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newSpace = await res.json();
        setSpaces((prev) => [...prev, newSpace]);
        setFormData({ name: '', description: '', icon: '🎯' });
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error("Failed to create space", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Spaces & Communities</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
        >
          {showCreateForm ? 'Cancel' : '+ Create Space'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Create New Space</h3>
          <form onSubmit={handleCreateSpace} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Space Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Photography Enthusiasts"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-fuchsia-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this space about?"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-fuchsia-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Pick an emoji"
                maxLength={2}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-fuchsia-500 focus:outline-none text-2xl"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Space'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {spaces.map((space) => (
          <div key={space.id} className={`rounded-3xl shadow-xl p-6 flex flex-col items-start bg-gradient-to-r ${space.color} text-white relative`}>
            <div className="text-4xl mb-2">{space.icon}</div>
            <div className="font-bold text-xl mb-1">{space.name}</div>
            <div className="mb-4 text-white/90">{space.description}</div>
            <button
              className={`mt-auto px-5 py-2 rounded-full font-semibold shadow transition-all ${joined.includes(space.id) ? 'bg-white text-fuchsia-700' : 'bg-fuchsia-700 text-white hover:bg-fuchsia-800'}`}
              onClick={() => toggleSpace(space.id)}
              disabled={loading}
            >
              {joined.includes(space.id) ? 'Leave Space' : 'Join Space'}
            </button>
            {joined.includes(space.id) && (
              <span className="absolute top-4 right-4 bg-white text-fuchsia-700 px-3 py-1 rounded-full text-xs font-bold shadow">Joined</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
