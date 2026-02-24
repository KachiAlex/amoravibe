"use client";
import React, { useEffect, useState } from "react";
import ProfileTab from "./ProfileTab";
import ProfileEditModal from "./ProfileEditModal";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  function handleEdit() {
    setEditing(true);
  }

  function handleSave(updated: any) {
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile);
        setEditing(false);
      })
      .catch(() => setError('Failed to update profile'));
  }

  if (loading) return <div className="text-center py-12 text-lg text-gray-400">Loading profile...</div>;
  if (error) return <div className="text-center py-12 text-lg text-red-500">{error}</div>;
  if (!profile) return null;

  return <>
    <ProfileTab profile={profile} onEdit={handleEdit} />
    {editing && (
      <ProfileEditModal
        profile={profile}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
      />
    )}
  </>;
}
