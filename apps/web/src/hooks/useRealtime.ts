'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface RealtimeEvent {
  event: string;
  data: unknown;
}

interface UseRealtimeOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

interface RealtimeState {
  connected: boolean;
  connectionId: string | null;
  unreadNotifications: number;
  activeBets: number;
  balance: number;
}

type EventHandler = (data: unknown) => void;

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 5000,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<RealtimeState>({
    connected: false,
    connectionId: null,
    unreadNotifications: 0,
    activeBets: 0,
    balance: 0,
  });

  // Add event handler
  const on = useCallback((event: string, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    // Return cleanup function
    return () => {
      handlersRef.current.get(event)?.delete(handler);
    };
  }, []);

  // Remove event handler
  const off = useCallback((event: string, handler: EventHandler) => {
    handlersRef.current.get(event)?.delete(handler);
  }, []);

  // Dispatch event to handlers
  const dispatch = useCallback((event: string, data: unknown) => {
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in realtime handler for ${event}:`, error);
        }
      });
    }
  }, []);

  // Connect to SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/realtime');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setState(prev => ({ ...prev, connected: true }));
      onConnect?.();

      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.onerror = (error) => {
      setState(prev => ({ ...prev, connected: false }));
      onError?.(error);

      // Auto reconnect
      if (autoReconnect && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, reconnectInterval);
      }
    };

    // Handle connected event
    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState(prev => ({
        ...prev,
        connected: true,
        connectionId: data.connectionId,
      }));
      dispatch('connected', data);
    });

    // Handle initial data
    eventSource.addEventListener('initial_data', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState(prev => ({
        ...prev,
        unreadNotifications: data.unreadNotifications || 0,
        activeBets: data.activeBets || 0,
        balance: data.balance || 0,
      }));
      dispatch('initial_data', data);
    });

    // Handle market updates
    eventSource.addEventListener('market_update', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      dispatch('market_update', data);
    });

    // Handle notification events
    eventSource.addEventListener('notification', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState(prev => ({
        ...prev,
        unreadNotifications: prev.unreadNotifications + 1,
      }));
      dispatch('notification', data);
    });

    // Handle bet updates
    eventSource.addEventListener('bet_update', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      dispatch('bet_update', data);
    });

    // Handle balance updates
    eventSource.addEventListener('balance_update', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState(prev => ({
        ...prev,
        balance: data.balance,
      }));
      dispatch('balance_update', data);
    });

    // Handle market resolved
    eventSource.addEventListener('market_resolved', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      dispatch('market_resolved', data);
    });

    // Handle generic message event
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        dispatch('message', data);
      } catch {
        // Ignore parse errors (might be heartbeat)
      }
    };
  }, [autoReconnect, reconnectInterval, onConnect, onError, dispatch]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState(prev => ({ ...prev, connected: false, connectionId: null }));
    onDisconnect?.();
  }, [onDisconnect]);

  // Mark notifications as read (update local state)
  const markNotificationsRead = useCallback((count = 0) => {
    setState(prev => ({
      ...prev,
      unreadNotifications: count === 0 ? 0 : Math.max(0, prev.unreadNotifications - count),
    }));
  }, []);

  // Update balance (for optimistic updates)
  const updateBalance = useCallback((newBalance: number) => {
    setState(prev => ({ ...prev, balance: newBalance }));
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    on,
    off,
    markNotificationsRead,
    updateBalance,
  };
}

// Market-specific hook
export function useMarketRealtime(marketId: string) {
  const [probability, setProbability] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [lastTrade, setLastTrade] = useState<{
    type: 'YES' | 'NO';
    amount: number;
    timestamp: Date;
  } | null>(null);

  const { on, connected } = useRealtime();

  useEffect(() => {
    const unsubscribe = on('market_update', (data: unknown) => {
      const update = data as { marketId: string; probability?: number; volume?: number; trade?: unknown };
      if (update.marketId === marketId) {
        if (update.probability !== undefined) {
          setProbability(update.probability);
        }
        if (update.volume !== undefined) {
          setVolume(update.volume);
        }
        if (update.trade) {
          setLastTrade(update.trade as typeof lastTrade);
        }
      }
    });

    return unsubscribe;
  }, [marketId, on]);

  return {
    connected,
    probability,
    volume,
    lastTrade,
  };
}
