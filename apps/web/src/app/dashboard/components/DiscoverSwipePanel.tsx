import React, { useState } from "react";

const demoProfiles = [
  {
    id: "1",
    name: "Jessica Martinez",
    age: 27,
    job: "Graphic Designer",
    location: "San Francisco, CA",
    distance: "2 miles away",
    bio: "Adventure seeker and coffee addict. Always up for new experiences!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
];

export default function DiscoverSwipePanel({ profiles = demoProfiles, onBack }: { profiles?: typeof demoProfiles; onBack?: () => void }) {
  const [idx, setIdx] = useState(0);
  const profile = profiles[idx];

  function handleLike() {
    // Next profile or loop
    setIdx((i) => (i + 1) % profiles.length);
  }
  function handlePass() {
    setIdx((i) => (i + 1) % profiles.length);
  }
  function handleUndo() {
    setIdx((i) => (i === 0 ? profiles.length - 1 : i - 1));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex justify-between w-full max-w-xl mb-6">
        <button className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 font-medium" onClick={onBack}>Back to Dashboard</button>
      </div>
      <div className="relative w-full max-w-xl">
        <div className="rounded-3xl shadow-xl overflow-hidden bg-white">
          <div className="relative">
            <img src={profile.cover} alt="cover" className="w-full h-72 object-cover" />
            <span className="absolute top-4 right-4 bg-white bg-opacity-80 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full shadow">{profile.distance}</span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <img src={profile.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-fuchsia-200" />
              <div className="font-bold text-xl">{profile.name}, {profile.age}</div>
              <button className="ml-auto bg-fuchsia-50 text-fuchsia-700 rounded-full p-2" title="More info">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#F500A3"/><text x="10" y="15" textAnchor="middle" fontSize="14" fill="#fff">i</text></svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span>🧑‍🎨 {profile.job}</span>
              <span>📍 {profile.location}</span>
            </div>
            <div className="text-gray-700 text-sm mt-2">{profile.bio}</div>
          </div>
        </div>
      </div>
      <div className="flex gap-6 mt-8">
        <button className="bg-gray-100 text-gray-500 rounded-full w-12 h-12 flex items-center justify-center text-xl" onClick={handleUndo} title="Undo">
          &#8630;
        </button>
        <button className="bg-white border border-gray-300 text-red-500 rounded-full w-12 h-12 flex items-center justify-center text-xl" onClick={handlePass} title="Pass">
          &#10006;
        </button>
        <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl" onClick={handleLike} title="Like">
          &#10084;
        </button>
      </div>
    </div>
  );
}
