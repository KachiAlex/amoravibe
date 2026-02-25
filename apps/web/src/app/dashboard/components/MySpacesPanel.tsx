import React, { useState } from "react";

const SPACES = [
  { id: "straight", name: "Straight Space", icon: "❤️", color: "from-pink-400 to-fuchsia-600" },
  { id: "lgbtq", name: "LGBTQ+ Space", icon: "🌈", color: "from-yellow-400 to-pink-600" },
];

export default function MySpacesPanel({ userSpaces = ["lgbtq", "allies"] }: { userSpaces?: string[] }) {
  const [joined, setJoined] = useState<string[]>(userSpaces);
  const [visibility, setVisibility] = useState<{[id:string]: string}>(Object.fromEntries(joined.map(id => [id, "public"])));

  function handleVisibility(id: string, value: string) {
    setVisibility(v => ({ ...v, [id]: value }));
  }

  function leaveSpace(id: string) {
    setJoined(j => j.filter(s => s !== id));
    setVisibility(v => { const nv = { ...v }; delete nv[id]; return nv; });
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">My Spaces</h2>
      {joined.length === 0 && <div className="text-center text-gray-500">You have not joined any spaces yet.</div>}
      <div className="grid grid-cols-1 gap-8">
        {joined.map(id => {
          const space = SPACES.find(s => s.id === id);
          if (!space) return null;
          return (
            <div key={id} className={`rounded-3xl shadow-xl p-6 flex flex-col md:flex-row items-center bg-gradient-to-r ${space.color} text-white relative`}>
              <div className="text-4xl mb-2 md:mb-0 md:mr-6">{space.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-xl mb-1">{space.name}</div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name={`vis-${id}`} value="public" checked={visibility[id] === "public"} onChange={() => handleVisibility(id, "public")}/>
                    <span className="text-white">Public</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name={`vis-${id}`} value="private" checked={visibility[id] === "private"} onChange={() => handleVisibility(id, "private")}/>
                    <span className="text-white">Private</span>
                  </label>
                </div>
              </div>
              <button className="ml-0 md:ml-8 mt-4 md:mt-0 bg-white text-fuchsia-700 px-5 py-2 rounded-full font-semibold shadow" onClick={() => leaveSpace(id)}>Leave</button>
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold shadow-lg text-lg">Save Changes</button>
      </div>
    </div>
  );
}
