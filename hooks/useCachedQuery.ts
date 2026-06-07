"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CacheEntry<T> {
 data: T;
 timestamp: number;
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache global en mémoire (se réinitialise au refresh)
const queryCache = new Map<string, CacheEntry<unknown>>();

export function useCachedQuery<T>(
 key: string,
 fetchFn: () => Promise<T>,
 options: {
 enabled?: boolean;
 cacheDuration?: number;
 refetchOnFocus?: boolean;
 } = {}
) {
 const { enabled = true, cacheDuration = DEFAULT_CACHE_DURATION, refetchOnFocus = false } = options;
 
 const [data, setData] = useState<T | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const isMountedRef = useRef(true);

 const fetchData = useCallback(async (force = false) => {
 if (!enabled) return;

 const cached = queryCache.get(key) as CacheEntry<T> | undefined;
 const isCachedValid = cached && Date.now() - cached.timestamp < cacheDuration;

  if (isCachedValid && !force && cached.data) {
 if (isMountedRef.current) {
 setData(cached.data);
 setLoading(false);
 }
 return;
 }

 if (!isMountedRef.current) return;

 setLoading(true);
 setError(null);

 try {
 const result = await fetchFn();
 
 if (isMountedRef.current) {
  setData(result);
  queryCache.set(key, { data: result, timestamp: Date.now() });
 }
 } catch (err) {
 if (isMountedRef.current) {
 setError(err instanceof Error ? err.message : "Erreur de chargement");
 // En cas d'erreur, utiliser le cache expiré si disponible
 if (cached?.data) {
 setData(cached.data);
 }
 }
 } finally {
 if (isMountedRef.current) {
 setLoading(false);
 }
 }
 }, [key, fetchFn, enabled, cacheDuration]);

  useEffect(() => {
  isMountedRef.current = true;
  fetchData();

  return () => {
  isMountedRef.current = false;
  };
  }, [fetchData]);

  useEffect(() => {
 if (!refetchOnFocus) return;

 const handleFocus = () => {
 fetchData(true); // Force refresh
 };

 window.addEventListener("focus", handleFocus);
 return () => window.removeEventListener("focus", handleFocus);
 }, [fetchData, refetchOnFocus]);

 const refetch = useCallback(() => fetchData(true), [fetchData]);

 const clearCache = useCallback(() => {
 queryCache.delete(key);
 }, [key]);

 return { data, loading, error, refetch, clearCache };
}

export function usePrefetch(key: string, fetchFn: () => Promise<unknown>) {
 const prefetch = useCallback(() => {
 const cached = queryCache.get(key);
 if (cached && Date.now() - cached.timestamp < DEFAULT_CACHE_DURATION) {
 return; // Déjà en cache
 }
 fetchFn().then(result => {
 queryCache.set(key, { data: result, timestamp: Date.now() });
 }).catch(() => {
 // Silencieux en cas d'erreur
 });
 }, [key, fetchFn]);

 return { prefetch };
}