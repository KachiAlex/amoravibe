import React, { useState } from "react";

const SPACES = [
  {
    id: "straight",
    name: "Straight Space",
    description: "A space for straight individuals to connect and meet.",
    color: "from-pink-400 to-fuchsia-600",
    icon: "❤️",
  },
  {
    id: "gay",
    name: "Gay Space",
    description: "A welcoming space for gay men.",
    color: "from-blue-400 to-indigo-600",
    icon: "🏳️‍🌈",
  },
  {
    id: "lesbian",
    name: "Lesbian Space",
    description: "A space for lesbians to connect and share.",
    color: "from-purple-400 to-pink-600",
    icon: "🌈",
  },
  {
    id: "bi",
    name: "Bisexual Space",
    description: "A space for bisexual individuals.",
    color: "from-green-400 to-blue-600",
    icon: "💚",
  },
  {
    id: "lgbtq",
    name: "LGBTQ+ Space",
    description: "An inclusive space for all LGBTQ+ identities.",
    color: "from-yellow-400 to-pink-600",
    icon: "🌈",
  },
  {
    id: "allies",
    name: "Allies & Friends",
    description: "A space for supportive allies and friends.",
    color: "from-gray-400 to-gray-600",
    icon: "🤝",
  },
];

export default function SpacesPanel({ userSpaces = [] }: { userSpaces?: string[] }) {
  const [joined, setJoined] = useState<string[]>(userSpaces);

  function toggleSpace(id: string) {
    setJoined((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Spaces & Communities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SPACES.map((space) => (
          <div key={space.id} className={`rounded-3xl shadow-xl p-6 flex flex-col items-start bg-gradient-to-r ${space.color} text-white relative`}>
            <div className="text-4xl mb-2">{space.icon}</div>
            <div className="font-bold text-xl mb-1">{space.name}</div>
            <div className="mb-4 text-white/90">{space.description}</div>
            <button
              className={`mt-auto px-5 py-2 rounded-full font-semibold shadow transition-all ${joined.includes(space.id) ? 'bg-white text-fuchsia-700' : 'bg-fuchsia-700 text-white hover:bg-fuchsia-800'}`}
              onClick={() => toggleSpace(space.id)}
            >
              {joined.includes(space.id) ? 'Leave Space' : 'Join Space'}
            </button>
            {joined.includes(space.id) && (
              <span className="absolute top-4 right-4 bg-white text-fuchsia-700 px-3 py-1 rounded-full text-xs font-bold shadow">Joined</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold shadow-lg text-lg">Save My Spaces</button>
      </div>
    </div>
  );
}
