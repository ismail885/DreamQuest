"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface UserStats {
  charactersCount: number;
  completedQuests: number;
  totalXp: number;
  maxLevel: number;
  userLevel: number;
  userXp: number;
}

interface UseDashboardDataReturn {
  stats: UserStats;
  statsLoading: boolean;
  statsError: string | null;
  suggestions: { id: number; titre: string; description: string | null }[];
  loadingSuggestions: boolean;
  refresh: () => void;
}

export function useDashboardData(userId: string | number | null): UseDashboardDataReturn {
  const [stats, setStats] = useState<UserStats>({
    charactersCount: 0,
    completedQuests: 0,
    totalXp: 0,
    maxLevel: 0,
    userLevel: 0,
    userXp: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    { id: number; titre: string; description: string | null }[]
  >([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchData = async () => {
      setStatsLoading(true);
      setLoadingSuggestions(true);
      setStatsError(null);

      try {
        const [userResult, charResult, saveResult] = await Promise.all([
          supabase
            .from("utilisateur")
            .select("niveau, experience")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("personnage")
            .select("experience, niveau")
            .eq("id_utilisateur", userId),
          supabase
            .from("sauvegarde")
            .select("progression, id_aventure")
            .eq("id_utilisateur", userId),
        ]);

        if (cancelled) return;

        const characters = charResult.data ?? [];
        const saves = saveResult.data ?? [];

        setStats({
          charactersCount: characters.length,
          completedQuests: saves.filter((s) => (s.progression ?? 0) >= 100).length,
          totalXp: characters.reduce((sum, c) => sum + (c.experience ?? 0), 0),
          maxLevel:
            characters.length > 0
              ? Math.max(...characters.map((c) => c.niveau ?? 1))
              : 0,
          userLevel: userResult?.data?.niveau ?? 1,
          userXp: userResult?.data?.experience ?? 0,
        });

        const playedIds = saves.map((s) => s.id_aventure).filter(Boolean);
        const advQuery = supabase
          .from("aventure")
          .select("id, titre, description")
          .order("popularite", { ascending: false })
          .limit(3);

        if (playedIds.length > 0) {
          advQuery.not("id", "in", `(${playedIds.join(",")})`);
        }

        const { data: advData } = await advQuery;
        if (!cancelled) setSuggestions(advData ?? []);
      } catch (err) {
        console.error("[Dashboard] Erreur chargement:", err);
        setStatsError(
          "Impossible de charger vos statistiques. Réessayez plus tard."
        );
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
          setLoadingSuggestions(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey]);

  return {
    stats,
    statsLoading,
    statsError,
    suggestions,
    loadingSuggestions,
    refresh,
  };
}
