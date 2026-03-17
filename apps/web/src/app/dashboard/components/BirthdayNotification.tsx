import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface BirthdayUser {
  id: string;
  displayName: string;
  avatar: string | null;
}

interface BirthdayNotificationProps {
  spaceId?: string;
  roomId?: string;
}

export default function BirthdayNotification({ spaceId, roomId }: BirthdayNotificationProps) {
  const [birthdayUsers, setBirthdayUsers] = useState<BirthdayUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBirthdays() {
      if (!spaceId && !roomId) {
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (spaceId) params.append('spaceId', spaceId);
        if (roomId) params.append('roomId', roomId);

        const res = await fetch(`/api/birthdays/today?${params}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setBirthdayUsers(data.birthdayUsers || []);
        }
      } catch (err) {
        console.error('[BirthdayNotification] Error fetching birthdays:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBirthdays();
  }, [spaceId, roomId]);

  if (loading || birthdayUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">🎂</span>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-900 mb-2">
            🎉 Birthday Today! 🎉
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {birthdayUsers.map((user) => (
              <div
                key={user.id}
                className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1.5 text-sm font-semibold text-yellow-800 border border-yellow-200 shadow-sm"
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.displayName}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center text-xs font-bold text-yellow-700">
                    {user.displayName[0].toUpperCase()}
                  </div>
                )}
                <span>{user.displayName}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-yellow-700 mt-2">
            Join us in celebrating! 🥳
          </p>
        </div>
      </div>
    </div>
  );
}
