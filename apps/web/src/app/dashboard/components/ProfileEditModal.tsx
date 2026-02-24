import React, { useState } from "react";

export default function ProfileEditModal({ profile, onSave, onCancel }: { profile: any, onSave: (p: any) => void, onCancel: () => void }) {
  const [form, setForm] = useState(profile);
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative" onSubmit={handleSubmit}>
        <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl" onClick={onCancel} aria-label="Close">&times;</button>
        <h2 className="font-bold text-2xl mb-4">Edit Profile</h2>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Job</label>
          <input name="job" value={form.job} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">About</label>
          <textarea name="about" value={form.about} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Interests (comma separated)</label>
          <input name="interests" value={form.interests?.join(', ') || ''} onChange={e => setForm((f: any) => ({ ...f, interests: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="mt-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg">Save</button>
      </form>
    </div>
  );
}