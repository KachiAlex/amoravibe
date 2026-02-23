import React from "react";

export default function SettingsPanel() {
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

      {/* Settings Section */}
      <div className="px-2">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <div className="flex flex-col gap-3">
            <button className="flex justify-between items-center w-full bg-transparent border-none text-left text-base text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg px-4 py-3 cursor-pointer">
              <span>Email & Password</span>
              <span>&rarr;</span>
            </button>
            <button className="flex justify-between items-center w-full bg-transparent border-none text-left text-base text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg px-4 py-3 cursor-pointer">
              <span>Privacy Settings</span>
              <span>&rarr;</span>
            </button>
            <button className="flex justify-between items-center w-full bg-transparent border-none text-left text-base text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg px-4 py-3 cursor-pointer">
              <span>Notifications</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <div className="flex flex-col gap-3">
            <button className="flex justify-between items-center w-full bg-transparent border-none text-left text-base text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg px-4 py-3 cursor-pointer">
              <span>Theme</span>
              <span>&rarr;</span>
            </button>
            <button className="flex justify-between items-center w-full bg-transparent border-none text-left text-base text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg px-4 py-3 cursor-pointer">
              <span>Language</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
