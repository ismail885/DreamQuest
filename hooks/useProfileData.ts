"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { calculateAchievements, UserAchievements } from "@/lib/achievements";
import { getDailyQuests, DailyQuest } from "@/lib/dailyQuests";
import { getCurrentSeason } from "@/lib/seasons";
import type {
  ExtendedUserProfile,
  UserStats,
  UserSave,
  UserCreation,
  Character,
  CharacterClass,
} from "@/types";

interface RawCharacter {
  id: number;
  nom_personnage: string;
  classe: string;
  niveau: number | null;
  points_vie: number | null;
  id_utilisateur: number;
}

interface RawSave {
  id: number;
  id_utilisateur: number;
  id_aventure: number;
  id_personnage: number;
  id_embranchement_actuel: number | null;
  progression: number | null;
  date_sauvegarde: string;
  aventure: { titre: string }[];
  personnage: { nom_personnage: string; classe: string }[];
}

interface UseProfileDataProps {
  userId: number | null;
  enabled?: boolean;
}

interface UseProfileDataReturn {
  loading: boolean;
  dataError: string | null;
  userProfile: ExtendedUserProfile | null;
  userSaves: UserSave[];
  userCreations: UserCreation[];
  userCharacters: Character[];
  userAchievements: UserAchievements | null;
  dailyQuests: DailyQuest[];
  stats: UserStats;
  refresh: () => void;
}

export function useProfileData({
  userId,
  enabled = true,
}: UseProfileDataProps): UseProfileDataReturn {
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [userSaves, setUserSaves] = useState<UserSave[]>([]);
  const [userCreations, setUserCreations] = useState<UserCreation[]>([]);
  const [userCharacters, setUserCharacters] = useState<Character[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [stats, setStats] = useState<UserStats>({
    storiesPlayed: 0,
    storiesCreated: 0,
    likes: 0,
    trophies: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async (uid: number) => {
    setLoading(true);
    setDataError(null);

    try {
      const questData = await getDailyQuests(uid);
      setDailyQuests(questData.quests);

      const { data: profileData } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("id", uid)
        .single();

      const season = getCurrentSeason();

      if (profileData) {
        setUserProfile({
          id: profileData.id,
          nom_utilisateur: profileData.nom_utilisateur || "Aventurier",
          email: profileData.email || "",
          date_creation: profileData.date_creation || "",
          role: profileData.role || "joueur",
          niveau: profileData.niveau || 1,
          experience: profileData.experience || 0,
          saison_actuelle: profileData.saison_actuelle ?? season.id,
          meilleur_niveau: profileData.meilleur_niveau ?? (profileData.niveau || 1),
        });
      } else {
        setUserProfile({
          id: uid,
          nom_utilisateur: "Aventurier",
          email: "",
          date_creation: "",
          role: "joueur",
          niveau: 1,
          experience: 0,
          saison_actuelle: season.id,
          meilleur_niveau: 1,
        });
      }

      const { data: savesData } = await supabase
        .from("sauvegarde")
        .select(
          `id, id_utilisateur, id_aventure, id_personnage, id_embranchement_actuel, progression, date_sauvegarde, aventure:id_aventure (titre), personnage:id_personnage (nom_personnage, classe)`,
        )
        .eq("id_utilisateur", uid);

      if (savesData && savesData.length > 0) {
        // Collecter les IDs des aventures sans titre pour les fetch en une seule requête
        const missingAdventureIds = savesData
          .filter((save: RawSave) => !save.aventure?.[0]?.titre)
          .map((save: RawSave) => save.id_aventure)
          .filter(Boolean);

        const titleMap = new Map<number, string>();
        if (missingAdventureIds.length > 0) {
          const { data: advFallback } = await supabase
            .from("aventure")
            .select("id, titre")
            .in("id", missingAdventureIds);
          if (advFallback) {
            for (const a of advFallback) {
              titleMap.set(a.id, a.titre);
            }
          }
        }

        const formattedSaves: UserSave[] = savesData.map((save: RawSave) => ({
          id: save.id,
          id_utilisateur: save.id_utilisateur,
          id_aventure: save.id_aventure,
          id_personnage: save.id_personnage,
          id_embranchement_actuel: save.id_embranchement_actuel,
          progression: save.progression ?? 0,
          date_sauvegarde: save.date_sauvegarde,
          aventure_titre: save.aventure?.[0]?.titre || titleMap.get(save.id_aventure) || "Aventure inconnue",
          personnage_nom: save.personnage[0]?.nom_personnage,
          personnage_classe: save.personnage[0]?.classe,
          status: (save.progression ?? 0) >= 100 ? "completed" as const : "in-progress" as const,
        }));
        setUserSaves(formattedSaves);
      } else {
        setUserSaves([]);
      }

      const { data: creationsData, error: creationsError } = await supabase
        .from("aventure")
        .select("id, titre, popularite")
        .eq("auteur_id", uid);

      if (creationsError) {
        console.error("Erreur chargement créations:", creationsError);
      }

      if (creationsData && creationsData.length > 0) {
        setUserCreations(
          creationsData.map(
            (c: { id: number; titre: string; popularite: number }) => ({
              id: c.id,
              titre: c.titre,
              popularite: c.popularite || 0,
            }),
          ),
        );
      } else {
        setUserCreations([]);
      }

      const { count: votesCount } = await supabase
        .from("vote")
        .select("id_vote", { count: "exact" })
        .eq("id_utilisateur", uid);

      const { count: charactersCount } = await supabase
        .from("personnage")
        .select("id", { count: "exact" })
        .eq("id_utilisateur", uid);

      const { data: charactersData } = await supabase
        .from("personnage")
        .select("*")
        .eq("id_utilisateur", uid);

      if (charactersData && charactersData.length > 0) {
        const formattedCharacters: Character[] = charactersData.map(
          (c: RawCharacter) => ({
            id: c.id,
            nom_personnage: c.nom_personnage,
            classe: c.classe as CharacterClass,
            niveau: c.niveau ?? 1,
            points_vie: c.points_vie ?? 100,
            points_vie_max: c.points_vie ?? 100,
            stats: { force: 0, agility: 0, magie: 0, endurance: 0 },
            id_utilisateur: c.id_utilisateur,
          }),
        );
        setUserCharacters(formattedCharacters);
      } else {
        setUserCharacters([]);
      }

      setStats({
        storiesPlayed: savesData?.length || 0,
        storiesCreated: creationsData?.length || 0,
        likes: votesCount || 0,
        trophies: 0,
      });

      const achievements = calculateAchievements({
        storiesPlayed: savesData?.length || 0,
        charactersCreated: charactersCount || 0,
        votes: votesCount || 0,
        storiesCreated: creationsData?.length || 0,
        totalLikes:
          creationsData?.reduce((sum, c) => sum + (c.popularite || 0), 0) || 0,
        level: profileData?.niveau || 1,
      });
      setUserAchievements(achievements);
    } catch {
      setDataError("Impossible de charger vos données. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId || !enabled) return;
    loadData(userId);
  }, [userId, enabled, refreshKey, loadData]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    loading,
    dataError,
    userProfile,
    userSaves,
    userCreations,
    userCharacters,
    userAchievements,
    dailyQuests,
    stats,
    refresh,
  };
}
