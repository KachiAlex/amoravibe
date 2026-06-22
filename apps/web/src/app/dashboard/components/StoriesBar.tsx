"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Story {
  id: string;
  mediaUrl: string;
  caption?: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    displayName: string | null;
    avatar: string | null;
  };
}

interface StoryGroup {
  userId: string;
  user: Story["user"];
  stories: Story[];
}

export default function StoriesBar() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [activeStory, setActiveStory] = useState<{ groupIndex: number; storyIndex: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const mapped: StoryGroup[] = [];
        if (data.grouped) {
          for (const [uid, stories] of Object.entries(data.grouped)) {
            const s = stories as Story[];
            if (s.length > 0) {
              mapped.push({ userId: uid, user: s[0].user, stories: s });
            }
          }
        }
        setGroups(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="px-4 py-3 text-sm text-gray-400">Loading stories…</div>;
  if (groups.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto px-4 py-3 scrollbar-hide">
        {groups.map((group, idx) => (
          <button
            key={group.userId}
            onClick={() => setActiveStory({ groupIndex: idx, storyIndex: 0 })}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-fuchsia-500 to-purple-500">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <Image
                  src={group.user.avatar || "/images/default-avatar.png"}
                  alt={group.user.displayName || group.user.name || "User"}
                  width={64}
                  height={64}
                  className="w-full h-full rounded-full object-cover"
                  unoptimized={!group.user.avatar?.includes("cloudinary")}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-700 truncate max-w-[4rem]">
              {group.user.displayName || group.user.name || "User"}
            </span>
          </button>
        ))}
      </div>

      {activeStory && (
        <StoryViewer
          groups={groups}
          active={activeStory}
          onClose={() => setActiveStory(null)}
          onNext={() => {
            const { groupIndex, storyIndex } = activeStory;
            const group = groups[groupIndex];
            if (storyIndex < group.stories.length - 1) {
              setActiveStory({ groupIndex, storyIndex: storyIndex + 1 });
            } else if (groupIndex < groups.length - 1) {
              setActiveStory({ groupIndex: groupIndex + 1, storyIndex: 0 });
            } else {
              setActiveStory(null);
            }
          }}
        />
      )}
    </>
  );
}

function StoryViewer({
  groups,
  active,
  onClose,
  onNext,
}: {
  groups: StoryGroup[];
  active: { groupIndex: number; storyIndex: number };
  onClose: () => void;
  onNext: () => void;
}) {
  const group = groups[active.groupIndex];
  const story = group.stories[active.storyIndex];

  useEffect(() => {
    const timer = setTimeout(onNext, 5000);
    return () => clearTimeout(timer);
  }, [active, onNext]);

  return (
    <div
      className="fixed inset-0 bg-black z-[60] flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center gap-3 p-4">
        <Image
          src={group.user.avatar || "/images/default-avatar.png"}
          alt=""
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover"
          unoptimized={!group.user.avatar?.includes("cloudinary")}
        />
        <span className="text-white font-semibold text-sm">
          {group.user.displayName || group.user.name}
        </span>
        <button onClick={onClose} className="ml-auto text-white text-2xl">&times;</button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={story.mediaUrl}
          alt={story.caption || "Story"}
          className="max-h-full max-w-full object-contain rounded-lg"
        />
      </div>
      {story.caption && (
        <div className="p-4 text-white text-center text-sm">{story.caption}</div>
      )}
      <div className="flex gap-1 px-4 pb-4">
        {group.stories.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < active.storyIndex ? "bg-white" : i === active.storyIndex ? "bg-white/80" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
