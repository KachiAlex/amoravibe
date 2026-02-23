import React from "react";

export default function ProfilePanel() {
  // Demo profile data
  const profile = {
    name: "John Doe",
    age: 29,
    location: "San Francisco, CA",
    job: "Product Manager",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=F500A3&color=fff&size=128",
    about: "Passionate about technology and outdoor adventures. Love trying new restaurants and exploring different cultures. Looking for someone to share life's adventures with.",
    interests: ["Hiking", "Photography", "Travel", "Cooking", "Reading", "Music"],
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      <div className="flex gap-6 mt-2 mb-6">
        <div className="bg-white rounded-xl shadow p-5 flex-1 flex flex-col items-center">
          <div className="text-fuchsia-600 text-2xl mb-1">24</div>
          <div className="font-semibold text-gray-700">Total Matches</div>
          <div className="text-green-500 text-xs mt-1">+12 this week</div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex-1 flex flex-col items-center">
          <div className="text-fuchsia-600 text-2xl mb-1">18</div>
          <div className="font-semibold text-gray-700">Active Chats</div>
          <div className="text-green-500 text-xs mt-1">+5 today</div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex-1 flex flex-col items-center">
          <div className="text-fuchsia-600 text-2xl mb-1">156</div>
          <div className="font-semibold text-gray-700">Profile Views</div>
          <div className="text-purple-500 text-xs mt-1">Top 10%</div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center relative">
        <div className="absolute top-6 right-6">
          <button className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold px-5 py-2 rounded-full text-md shadow hover:scale-105 transition">
            Edit Profile
          </button>
        </div>
        <img src={profile.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-3" />
        <div className="font-bold text-2xl mb-1">{profile.name}, {profile.age}</div>
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <span>📍 {profile.location}</span>
          <span>💼 {profile.job}</span>
        </div>
        <div className="w-full mt-6">
          <h4 className="font-semibold text-lg mb-2">About Me</h4>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-base mb-4">{profile.about}</div>
          <h4 className="font-semibold text-lg mb-2">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span key={interest} className="bg-gradient-to-r from-fuchsia-100 to-purple-100 text-fuchsia-700 px-4 py-2 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
