"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ProfileTab({ profile, onEdit }: { profile: any; onEdit: () => void }) {
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '/images/default-avatar.png');
  const [photos, setPhotos] = useState<string[]>(Array.isArray(profile.photos) ? profile.photos : []);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAvatarPreview(profile.avatar || '/images/default-avatar.png');
    setPhotos(Array.isArray(profile.photos) ? profile.photos : []);
  }, [profile.avatar, profile.photos]);

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
        <Image 
          src={profile.cover || '/images/default-cover.jpg'} 
          alt="cover" 
          width={800} 
          height={256} 
          className="w-full h-64 object-cover" 
          style={{borderTopLeftRadius:'1.5rem',borderTopRightRadius:'1.5rem'}}
          priority={false}
          quality={80}
          sizes="(max-width: 640px) 100vw, 32rem"
        />
        <div className="absolute left-1/2 top-48 -translate-x-1/2 flex flex-col items-center gap-3">
          <Image 
            src={avatarPreview} 
            alt="avatar" 
            width={128} 
            height={128} 
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            priority={false}
            quality={85}
          />
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
          {/* Photo gallery */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-3 py-1 rounded-full text-sm font-semibold bg-white text-fuchsia-600 border border-fuchsia-200 shadow hover:bg-fuchsia-50"
                  disabled={uploadingPhotos}
                >
                  {uploadingPhotos ? 'Uploading…' : 'Add photos'}
                </button>
              </div>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                setUploadingPhotos(true);
                setError(null);
                try {
                  for (const file of files) {
                    const signRes = await fetch('/api/uploads/sign', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ folder: 'photos' }),
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
                    const photoUrl = uploaded.secure_url as string;
                    const profileRes = await fetch('/api/profile', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ addPhoto: photoUrl }),
                    });
                    if (!profileRes.ok) {
                      throw new Error('Failed to save photo');
                    }
                    setPhotos((prev) => (prev.includes(photoUrl) ? prev : [...prev, photoUrl]));
                  }
                  onEdit?.();
                } catch (err) {
                  console.error('Gallery upload failed', err);
                  setError((err as Error).message || 'Photo upload failed');
                } finally {
                  setUploadingPhotos(false);
                  if (galleryInputRef.current) {
                    galleryInputRef.current.value = '';
                  }
                }
              }}
            />
            {photos.length === 0 && (
              <p className="text-sm text-gray-500">No photos yet. Add some to showcase your profile.</p>
            )}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {photos.map((url) => (
                  <div key={url} className="relative group rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                    <img src={url} alt="user photo" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/profile', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ removePhoto: url }),
                          });
                          if (!res.ok) throw new Error('Failed to remove photo');
                          setPhotos((prev) => prev.filter((p) => p !== url));
                          onEdit?.();
                        } catch (err) {
                          setError((err as Error).message || 'Failed to remove photo');
                        }
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {profile.socialLinks?.map((link: any) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener" className="text-fuchsia-700 underline text-sm">{link.label}</a>
            ))}
          </div>
          <button className="mt-8 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg" onClick={onEdit}>Edit Profile</button>
          {error && <div className="mt-2 text-sm text-red-500 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
}
