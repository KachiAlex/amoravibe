'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface UserProfile {
  id: string;
  displayName: string;
  name: string;
  age?: number;
  location?: string;
  job?: string;
  about?: string;
  interests: string[];
  avatar?: string;
  photos: string[];
  gender?: string;
  orientation?: string;
  lookingFor?: string;
  isVerified: boolean;
}

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${userId}/profile`, {
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch profile');
        }

        const data = await res.json();
        setProfile(data.profile);
        setCurrentPhotoIndex(0);
      } catch (err) {
        setError((err as Error).message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-2xl font-bold">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading profile...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : profile ? (
          <div className="p-6">
            {/* Cover and Avatar */}
            <div className="mb-6">
              <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-fuchsia-100 to-purple-100 mb-4 flex items-center justify-center">
                <span className="text-5xl">💜</span>
              </div>
              <div className="flex gap-4">
                <div className="w-24 h-24 -mt-12 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white justify-center flex items-center">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.displayName}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-3xl font-bold text-fuchsia-700">
                      {profile.displayName[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">
                      {profile.displayName || profile.name}, {profile.age}
                    </h3>
                    {profile.isVerified && <span className="text-blue-500">✓ Verified</span>}
                  </div>
                  {profile.job && <p className="text-gray-600">💼 {profile.job}</p>}
                  {profile.location && <p className="text-gray-600">📍 {profile.location}</p>}
                </div>
              </div>
            </div>

            {/* About */}
            {profile.about && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">{profile.about}</p>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-gradient-to-r from-fuchsia-50 to-purple-50 text-fuchsia-700 px-3 py-1.5 rounded-full border border-fuchsia-100"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Looking For */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {profile.gender && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold">{profile.gender}</p>
                </div>
              )}
              {profile.orientation && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Orientation</p>
                  <p className="font-semibold">{profile.orientation}</p>
                </div>
              )}
              {profile.lookingFor && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Looking For</p>
                  <p className="font-semibold">{profile.lookingFor}</p>
                </div>
              )}
            </div>

            {/* Photos Gallery */}
            {profile.photos && profile.photos.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Photos</h4>
                <div className="space-y-3">
                  <div className="relative h-80 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profile.photos[currentPhotoIndex] ? (
                      <Image
                        src={profile.photos[currentPhotoIndex]}
                        alt={`Photo ${currentPhotoIndex + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-gray-400">Photo not available</span>
                    )}
                  </div>
                  {profile.photos.length > 1 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPhotoIndex(
                            (prev) => (prev - 1 + profile.photos.length) % profile.photos.length
                          )
                        }
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-semibold"
                      >
                        ←
                      </button>
                      <div className="flex-1 flex items-center justify-center text-sm text-gray-600">
                        {currentPhotoIndex + 1} / {profile.photos.length}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length)
                        }
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-semibold"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold shadow hover:shadow-lg transition">
                💬 Send Message
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
