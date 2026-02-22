import React from 'react';

export default function ProfilePanel() {
  return (
    <aside className="bg-white rounded-2xl shadow p-6" role="region" aria-label="Profile summary">
      <h3 className="text-lg font-bold mb-2">Profile</h3>
      <p className="text-gray-500">Profile summary and quick actions.</p>
    </aside>
  );
}
