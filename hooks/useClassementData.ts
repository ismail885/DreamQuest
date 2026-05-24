"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface RankingAdventure {
  id: number;
  titre: string;
  description: string | null;
  popularite: number;
  auteur_nom?: string;
}

export interface RankingPlayer {
  id: number;
  nom_utilisateur: string;
  personnage_nom: string;
  classe: string;
  niveau: number;
  experience: number;
}

interface UseClassementDataReturn {
  activeTab: "adventures" | "players";
  setActiveTab: (tab: "adventures" | "players") => void;
  adventures: RankingAdventure[];
  players: RankingPlayer[];
  loading: boolean;
  fetchError: string | null;
  refresh: () => void;
}

export function useClassementData(): UseClassementDataReturn {
  const [activeTab, setActiveTab] = useState<"adventures" | "players">("adventures");
  const [adventures, setAdventures] = useState<RankingAdventure[]>([]);
  const [players, setPlayers] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    setFetchError(null);
    let cancelled = false;

    const fetchRanking = async () => {
      setLoading(true);

      const query = supabase
        .from("aventure")
        .select(
          `
          id,
          titre,
          description,
          popularite,
          auteur:utilisateur(nom_utilisateur)
        `
        )
        .order("popularite", { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (!cancelled) {
        if (error) {
          console.error("Erreur:", error);
          setFetchError("Impossible de charger le classement.");
        } else {
          const formatted: RankingAdventure[] = (data ?? []).map(
            (a: Record<string, unknown>) => ({
              id: a.id as number,
              titre: a.titre as string,
              description: a.description as string | null,
              popularite: a.popularite as number,
              auteur_nom:
                (
                  (a.auteur as Record<string, unknown>)?.[0] as
                    | Record<string, string>
                    | undefined
                )?.nom_utilisateur ??
                (a.auteur as Record<string, string> | undefined)
                  ?.nom_utilisateur ??
                "Auteur inconnu",
            })
          );
          setAdventures(formatted);
        }
        setLoading(false);
      }
    };

    const fetchPlayers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("personnage")
        .select(
          `
          id,
          nom_personnage,
          classe,
          niveau,
          experience,
          utilisateur!inner(id, nom_utilisateur)
        `
        )
        .order("niveau", { ascending: false })
        .order("experience", { ascending: false })
        .limit(50);

      if (!cancelled) {
        if (error) {
          console.error("Erreur:", error);
          setFetchError("Impossible de charger le classement des joueurs.");
        } else if (data) {
          const formatted: RankingPlayer[] = (data ?? []).map(
            (p: Record<string, unknown>) => {
              const userData = p.utilisateur as Record<string, unknown>;
              return {
                id: p.id as number,
                nom_utilisateur:
                  (userData?.nom_utilisateur as string) || "Inconnu",
                personnage_nom: p.nom_personnage as string,
                classe: p.classe as string,
                niveau: p.niveau as number,
                experience: p.experience as number,
              };
            }
          );
          setPlayers(formatted);
        }
        setLoading(false);
      }
    };

    if (activeTab === "adventures") {
      fetchRanking();
    } else {
      fetchPlayers();
    }

    return () => {
      cancelled = true;
    };
  }, [activeTab, refreshKey]);

  return {
    activeTab,
    setActiveTab,
    adventures,
    players,
    loading,
    fetchError,
    refresh,
  };
}
