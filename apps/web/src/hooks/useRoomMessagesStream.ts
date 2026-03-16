import { useEffect, useRef, useCallback } from 'react';

interface SSEMessage {
  type: 'message' | 'connected' | 'error';
  data: any;
  isInitial?: boolean;
}

interface UseRoomMessagesStreamOptions {
  roomId: string;
  lastSync?: Date;
  onMessage?: (message: any, isInitial: boolean) => void;
  onConnected?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useRoomMessagesStream({
  roomId,
  lastSync,
  onMessage,
  onConnected,
  onError,
  enabled = true,
}: UseRoomMessagesStreamOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const callbacksRef = useRef({ onMessage, onConnected, onError });
  
  // Keep callback refs in sync without triggering hook dependencies
  useEffect(() => {
    callbacksRef.current = { onMessage, onConnected, onError };
  }, [onMessage, onConnected, onError]);
  
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback(() => {
    return baseReconnectDelay * Math.pow(2, Math.min(reconnectAttemptsRef.current, 3));
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !roomId) return;

    try {
      const url = new URL(`/api/rooms/${roomId}/messages/stream`, window.location.origin);
      
      if (lastSync) {
        url.searchParams.append('lastSync', lastSync.toISOString());
      }

      const eventSource = new EventSource(url.toString());

      eventSource.addEventListener('message', (event) => {
        try {
          const sseMsg: SSEMessage = JSON.parse(event.data);

          if (sseMsg.type === 'message' && callbacksRef.current.onMessage) {
            callbacksRef.current.onMessage(sseMsg.data, sseMsg.isInitial ?? false);
          } else if (sseMsg.type === 'connected' && callbacksRef.current.onConnected) {
            callbacksRef.current.onConnected();
            reconnectAttemptsRef.current = 0; // Reset on successful connection
          }
        } catch (err) {
          console.error('[SSE] Failed to parse message:', err);
        }
      });

      eventSource.addEventListener('error', () => {
        console.warn('[SSE] Connection error, will attempt to reconnect');
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = getReconnectDelay();
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('[SSE] Max reconnection attempts reached, falling back to polling');
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(new Error('SSE connection failed after multiple attempts'));
          }
        }
      });

      eventSourceRef.current = eventSource;
      console.log('[SSE] Connected to room stream:', roomId);
    } catch (err) {
      console.error('[SSE] Failed to connect:', err);
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(err instanceof Error ? err : new Error('SSE connection error'));
      }
    }
  }, [roomId, lastSync, enabled, getReconnectDelay]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, roomId, connect]);

  // Return connection status and ability to reconnect
  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: () => {
      reconnectAttemptsRef.current = 0;
      connect();
    },
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    },
  };
}
