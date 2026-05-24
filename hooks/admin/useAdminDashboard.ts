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
      const [usersRes, adventuresRes, charactersRes, votesRes, recentAdvRes] =
        await Promise.all([
          supabase
            .from("utilisateur")
            .select("role,date_creation", { count: "exact", head: false }),
          supabase
            .from("aventure")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("personnage")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("vote")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("aventure")
            .select("date_creation", { count: "exact", head: false }),
        ]);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const usersCount = usersRes.count || 0;
      const recentUsersCount =
        usersRes.data?.filter((u) => u.date_creation >= sevenDaysAgoStr)
          .length || 0;
      const activeTodayCount =
        usersRes.data?.filter((u) => u.date_creation >= todayStr).length || 0;
      const recentAdventuresCount =
        recentAdvRes.data?.filter((a) => a.date_creation >= sevenDaysAgoStr)
          .length || 0;

      const roleCounts = { admin: 0, joueur: 0, createur: 0 };
      usersRes.data?.forEach((u) => {
        if (u.role === "admin") roleCounts.admin++;
        else if (u.role === "joueur") roleCounts.joueur++;
        else if (u.role === "createur") roleCounts.createur++;
      });

      setStats({
        totalUsers: usersCount,
        totalAdventures: adventuresRes.count || 0,
        totalCharacters: charactersRes.count || 0,
        totalVotes: votesRes.count || 0,
        adminCount: roleCounts.admin,
        joueurCount: roleCounts.joueur,
        createurCount: roleCounts.createur,
        recentUsers: recentUsersCount,
        recentAdventures: recentAdventuresCount,
        activeUsersToday: activeTodayCount,
      });
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
