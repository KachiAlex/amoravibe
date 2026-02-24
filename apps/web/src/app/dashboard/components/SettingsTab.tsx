import React, { useState } from "react";

export default function SettingsTab({ settings, onSave, onDelete }: { settings: any, onSave: (s: any) => void, onDelete: () => void }) {
  const [form, setForm] = useState(settings);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="flex flex-col items-center min-h-[70vh] bg-gradient-to-br from-white via-fuchsia-50 to-purple-50">
      <form className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 mt-8" onSubmit={handleSave}>
        <h2 className="font-bold text-2xl mb-6 text-fuchsia-700">Settings</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Phone</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Show Distance</label>
          <input type="checkbox" name="showDistance" checked={form.showDistance} onChange={handleChange} className="mr-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Hide Profile</label>
          <input type="checkbox" name="hideProfile" checked={form.hideProfile} onChange={handleChange} className="mr-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Theme</label>
          <select name="theme" value={form.theme} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Notifications</label>
          <div className="flex gap-4">
            <label><input type="checkbox" name="notifyEmail" checked={form.notifyEmail} onChange={handleChange} className="mr-2" /> Email</label>
            <label><input type="checkbox" name="notifyPush" checked={form.notifyPush} onChange={handleChange} className="mr-2" /> Push</label>
            <label><input type="checkbox" name="notifySMS" checked={form.notifySMS} onChange={handleChange} className="mr-2" /> SMS</label>
          </div>
        </div>
        <button type="submit" className="mt-6 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg">Save Settings</button>
        <button type="button" className="mt-4 bg-red-100 text-red-700 px-6 py-2 rounded-full shadow-lg" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-50 rounded shadow text-center">
            <div className="mb-2 text-red-700 font-bold">Are you sure you want to delete your account?</div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full mr-2" onClick={onDelete}>Yes, Delete</button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          </div>
        )}
      </form>
    </div>
  );
}
