import React, { useEffect, useState } from "react";
import SettingsTab from "./SettingsTab";
import SettingsDeleteModal from "./SettingsDeleteModal";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  function handleSave(updated: any) {
    fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setError('Failed to update settings'));
  }

  function handleDelete() {
    setShowDelete(true);
  }

  async function confirmDelete() {
    setShowDelete(false);
    try {
      const res = await fetch('/api/profile/delete', { method: 'DELETE' });
      if (res.ok) {
        alert('Account deleted. You will be logged out.');
        // Optionally redirect or log out
        window.location.href = '/logout';
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch {
      alert('Failed to delete account');
    }
  }

  if (loading) return <div className="text-center py-12 text-lg text-gray-400">Loading settings...</div>;
  if (error) return <div className="text-center py-12 text-lg text-red-500">{error}</div>;
  if (!settings) return null;

  return <>
    <SettingsTab settings={settings} onSave={handleSave} onDelete={handleDelete} />
    {showDelete && (
      <SettingsDeleteModal onConfirm={confirmDelete} onCancel={() => setShowDelete(false)} />
    )}
  </>;
}
