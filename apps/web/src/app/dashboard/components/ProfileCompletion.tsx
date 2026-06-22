"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfileCompletion() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const user = data.user || data;
        
        let completed = 0;
        const fields = ['displayName', 'avatar', 'about', 'location', 'job', 'interests', 'photos', 'gender', 'orientation'];
        fields.forEach((field) => {
          const val = user[field];
          if (val && (Array.isArray(val) ? val.length > 0 : String(val).trim().length > 0)) {
            completed++;
          }
        });
        setProgress(Math.round((completed / fields.length) * 100));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 animate-pulse">
        <div className="h-4 bg-purple-100 rounded w-3/4 mb-3" />
        <div className="h-8 bg-purple-100 rounded w-1/2 mb-3" />
        <div className="h-2 bg-purple-100 rounded w-full" />
      </div>
    );
  }

  if (progress >= 100) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
      <p className="text-sm text-purple-700 font-medium mb-1">Complete your profile</p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold text-purple-600">{progress}</span>
        <span className="text-purple-400 text-sm">%</span>
      </div>
      <div className="w-full bg-purple-100 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Link
        href="/dashboard/profile"
        className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
      >
        Finish setup &rarr;
      </Link>
    </div>
  );
}
