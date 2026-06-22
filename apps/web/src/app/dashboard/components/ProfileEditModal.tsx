import React, { useState } from "react";

const PROMPT_OPTIONS = [
  "My simple pleasures",
  "Two truths and a lie",
  "Best travel story",
  "My ideal Sunday",
  "A life goal of mine",
  "What I'm looking for",
  "My greatest strength",
  "A hidden talent",
  "Favorite memory",
  "What makes me laugh",
];

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
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Profile Prompts</label>
          <div className="space-y-3">
            {[0, 1, 2].map((idx) => {
              const prompts = form.prompts || {};
              const questions = Object.keys(prompts);
              const question = questions[idx] || '';
              const answer = question ? prompts[question] : '';
              return (
                <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm mb-2 bg-white"
                    value={question}
                    onChange={(e) => {
                      const newQ = e.target.value;
                      setForm((f: any) => {
                        const current = { ...(f.prompts || {}) };
                        if (question) delete current[question];
                        if (newQ) current[newQ] = current[newQ] || '';
                        return { ...f, prompts: current };
                      });
                    }}
                  >
                    <option value="">Select a prompt...</option>
                    {PROMPT_OPTIONS.filter((opt) => !Object.keys(prompts).includes(opt) || opt === question).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {question && (
                    <textarea
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      placeholder="Your answer..."
                      value={answer}
                      onChange={(e) => {
                        setForm((f: any) => ({
                          ...f,
                          prompts: { ...(f.prompts || {}), [question]: e.target.value },
                        }));
                      }}
                      rows={2}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button type="submit" className="mt-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg">Save</button>
      </form>
    </div>
  );
}