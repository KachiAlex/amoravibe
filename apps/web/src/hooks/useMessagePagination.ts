import { useCallback, useRef, useState } from 'react';

interface Message {
  id: string;
  text: string;
  user: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  createdAt: string;
  localId?: string;
  status?: 'pending' | 'failed' | 'sent';
}

interface PaginationState {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

interface UseMessagePaginationOptions {
  roomId: string;
  initialLimit?: number;
  onMessagesLoaded?: (messages: Message[], isAppend: boolean) => void;
}

export function useMessagePagination({
  roomId,
  initialLimit = 50,
  onMessagesLoaded,
}: UseMessagePaginationOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    limit: initialLimit,
    offset: 0,
    total: 0,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(
    async (offset: number = 0, isAppend: boolean = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/rooms/${roomId}/messages?limit=${pagination.limit}&offset=${offset}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch messages');
        }

        const data = await res.json();
        const { messages: newMessages, pagination: newPagination } = data;

        if (isAppend) {
          // Prepend older messages (for scroll-up loading)
          setMessages((prev) => {
            const combined = [...newMessages, ...prev];
            // Deduplicate by ID
            const seen = new Set<string>();
            return combined.filter((m) => {
              if (seen.has(m.id)) return false;
              seen.add(m.id);
              return true;
            });
          });
        } else {
          // Replace messages (for initial load)
          setMessages(newMessages);
        }

        setPagination(newPagination);
        onMessagesLoaded?.(newMessages, isAppend);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch messages';
        setError(message);
        console.error('[MessagePagination] Error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [roomId, pagination.limit, onMessagesLoaded]
  );

  const loadPreviousMessages = useCallback(async () => {
    if (!pagination.hasMore || isLoading) return;
    const newOffset = pagination.offset + pagination.limit;
    await fetchMessages(newOffset, true);
  }, [pagination, isLoading, fetchMessages]);

  const loadInitialMessages = useCallback(async () => {
    await fetchMessages(0, false);
  }, [fetchMessages]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    setPagination((prev) => ({
      ...prev,
      total: prev.total + 1,
    }));
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId || m.localId === messageId ? { ...m, ...updates } : m))
    );
  }, []);

  return {
    messages,
    pagination,
    isLoading,
    error,
    fetchMessages: loadInitialMessages,
    loadPreviousMessages,
    addMessage,
    updateMessage,
    setMessages,
  };
}
