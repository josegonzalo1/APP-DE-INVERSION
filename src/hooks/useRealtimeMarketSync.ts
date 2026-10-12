import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveMarketQuote } from '../types';

interface UseRealtimeMarketSyncOptions {
  symbol?: string;
  initialQuote?: LiveMarketQuote | null;
  enabled?: boolean;
  intervalSeconds?: number;
  onQuoteUpdate?: (quote: LiveMarketQuote) => void;
}

export function useRealtimeMarketSync({
  symbol,
  initialQuote,
  enabled = true,
  intervalSeconds = 15,
  onQuoteUpdate,
}: UseRealtimeMarketSyncOptions) {
  const [liveQuote, setLiveQuote] = useState<LiveMarketQuote | null>(initialQuote || null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncActive, setIsAutoSyncActive] = useState(enabled);
  const [activeInterval, setActiveInterval] = useState(intervalSeconds);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [tickDirection, setTickDirection] = useState<'UP' | 'DOWN' | 'SAME' | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const prevPriceRef = useRef<number>(initialQuote?.price || 0);
  const timerRef = useRef<any>(null);
  const onQuoteUpdateRef = useRef(onQuoteUpdate);
  onQuoteUpdateRef.current = onQuoteUpdate;

  // Sync state if symbol or initialQuote changes
  useEffect(() => {
    if (initialQuote) {
      setLiveQuote(initialQuote);
      prevPriceRef.current = initialQuote.price;
      setLastSyncTime(new Date());
    }
  }, [symbol, initialQuote?.price]);

  const fetchLatestQuote = useCallback(async (isManual = false) => {
    if (!symbol) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const res = await fetch(`/api/market-quote?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error('Error de sincronización con Wall Street');
      const freshQuote: LiveMarketQuote = await res.json();

      if (freshQuote && freshQuote.price > 0) {
        // Compare price change to trigger visual tick animation
        const prev = prevPriceRef.current;
        if (prev > 0 && freshQuote.price > prev) {
          setTickDirection('UP');
        } else if (prev > 0 && freshQuote.price < prev) {
          setTickDirection('DOWN');
        } else {
          setTickDirection('SAME');
        }
        prevPriceRef.current = freshQuote.price;

        setLiveQuote(freshQuote);
        setLastSyncTime(new Date());

        if (onQuoteUpdateRef.current) {
          onQuoteUpdateRef.current(freshQuote);
        }

        // Reset tick highlight after 1.5s
        setTimeout(() => {
          setTickDirection(null);
        }, 1500);
      }
    } catch (err: any) {
      setSyncError(err.message || 'Error temporal de cotización');
    } finally {
      setIsSyncing(false);
    }
  }, [symbol]);

  // Interval polling loop
  useEffect(() => {
    if (!isAutoSyncActive || !symbol || activeInterval <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      fetchLatestQuote(false);
    }, activeInterval * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoSyncActive, symbol, activeInterval, fetchLatestQuote]);

  return {
    liveQuote,
    isSyncing,
    isAutoSyncActive,
    setIsAutoSyncActive,
    activeInterval,
    setActiveInterval,
    lastSyncTime,
    tickDirection,
    syncError,
    refreshNow: () => fetchLatestQuote(true),
  };
}
