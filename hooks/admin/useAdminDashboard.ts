"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Stats {
  totalUsers: number;
  totalAdventures: number;
  totalCharacters: number;
  totalVotes: number;
  adminCount: number;
  joueurCount: number;
  createurCount: number;
  recentUsers: number;
  recentAdventures: number;
  activeUsersToday: number;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAdventures: 0,
    totalCharacters: 0,
    totalVotes: 0,
    adminCount: 0,
    joueurCount: 0,
    createurCount: 0,
    recentUsers: 0,
    recentAdventures: 0,
    activeUsersToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) setIsRefreshing(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("admin_dashboard_stats");
      if (error) throw error;
      setStats(data as Stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(
        "Impossible de charger les statistiques. Vérifiez votre connexion à la base de données.",
      );
    } finally {
      setLoading(false);
      if (isAutoRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchStats(true);
      }, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, fetchStats]);

  return {
    stats,
    loading,
    error,
    isLive,
    lastUpdate,
    isRefreshing,
    setIsLive,
    fetchStats,
  };
}
