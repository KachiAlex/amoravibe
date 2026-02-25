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

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Spaces & Communities</h2>
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
