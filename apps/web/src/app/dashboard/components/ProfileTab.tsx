"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ProfileTab({ profile, onEdit }: { profile: any; onEdit: () => void }) {
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '/images/default-avatar.png');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAvatarPreview(profile.avatar || '/images/default-avatar.png');
  }, [profile.avatar]);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const signRes = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'avatars' }),
      });
      if (!signRes.ok) throw new Error('Unable to prepare upload.');
      const signature = await signRes.json();

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signature.apiKey);
      formData.append('timestamp', String(signature.timestamp));
      formData.append('signature', signature.signature);
      formData.append('upload_preset', signature.uploadPreset);
      if (signature.params?.folder) {
        formData.append('folder', signature.params.folder as string);
      }

      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
      const uploaded = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploaded?.error?.message || 'Upload failed');
      }

      const avatarUrl = uploaded.secure_url as string;
      const profileRes = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl }),
      });
      if (!profileRes.ok) {
        throw new Error('Failed to update profile');
      }

      setAvatarPreview(avatarUrl);
      onEdit?.();
    } catch (err) {
      setError((err as Error).message || 'Something went wrong');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="flex flex-col items-center min-h-[70vh] bg-gradient-to-br from-white via-fuchsia-50 to-purple-50">
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden bg-white mt-8">
        <img src={profile.cover || '/images/default-cover.jpg'} alt="cover" className="w-full h-64 object-cover" style={{borderTopLeftRadius:'1.5rem',borderTopRightRadius:'1.5rem'}} />
        <div className="absolute left-1/2 top-48 -translate-x-1/2 flex flex-col items-center gap-3">
          <img src={avatarPreview} alt="avatar" className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" />
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-fuchsia-600 border border-fuchsia-200 shadow hover:bg-fuchsia-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Change Photo'}
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="p-8 pt-20">
          <div className="font-extrabold text-3xl mb-2 text-gray-900 text-center">{profile.name}, {profile.age}</div>
          <div className="flex items-center justify-center gap-3 text-gray-600 mb-2">
            <span className="inline-flex items-center gap-1"><span role="img" aria-label="job">💼</span> {profile.job}</span>
            <span className="inline-flex items-center gap-1"><span role="img" aria-label="location">📍</span> {profile.location}</span>
          </div>
          <div className="text-gray-700 text-base mt-2 text-center">{profile.bio}</div>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {profile.interests?.map((interest: string) => (
              <span key={interest} className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-sm font-medium shadow">{interest}</span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {profile.socialLinks?.map((link: any) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener" className="text-fuchsia-700 underline text-sm">{link.label}</a>
            ))}
          </div>
          <button className="mt-8 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg" onClick={onEdit}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
