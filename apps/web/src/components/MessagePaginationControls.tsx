import React from 'react';

interface MessagePaginationControlsProps {
  isLoading: boolean;
  hasMore: boolean;
  canLoadPrevious: boolean;
  onLoadPrevious: () => Promise<void>;
  totalMessages: number;
  displayedMessages: number;
}

export function MessagePaginationControls({
  isLoading,
  hasMore,
  canLoadPrevious,
  onLoadPrevious,
  totalMessages,
  displayedMessages,
}: MessagePaginationControlsProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onLoadPrevious();
  };

  if (!hasMore) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        {totalMessages === 0 ? 'No messages yet' : 'Start of conversation'}
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <button
        onClick={handleClick}
        disabled={isLoading || !canLoadPrevious}
        className="text-sm px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 transition"
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin mr-2">⟳</span>
            Loading...
          </>
        ) : (
          `Load earlier messages (${totalMessages - displayedMessages} more)`
        )}
      </button>
    </div>
  );
}
