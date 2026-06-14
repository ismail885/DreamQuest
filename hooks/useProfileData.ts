"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { calculateAchievements, UserAchievements } from "@/lib/achievements";
import { getDailyQuests, DailyQuest } from "@/lib/dailyQuests";
import { getCurrentSeason } from "@/lib/seasons";
import { getPrestigeTier } from "@/lib/leveling";
const PROFILE_REFRESH_EVENT = "profile-refresh";
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
  const initialLoadDone = useRef(false);

  const loadData = useCallback(async (uid: number, isCancelled: () => boolean) => {
    // Loader plein écran uniquement au premier chargement ;
    // les rafraîchissements (focus, refresh) se font en arrière-plan.
    if (!initialLoadDone.current) setLoading(true);
    setDataError(null);

    try {
      const questData = await getDailyQuests(uid);
      if (isCancelled()) return;
      setDailyQuests(questData.quests);

      const { data: profileData } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("id", uid)
        .single();

      const season = getCurrentSeason();

      if (isCancelled()) return;
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
        // Fallback pour les titres d'aventures manquants
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

        // Fallback pour les noms de personnages manquants
        const missingPersonnageIds = savesData
          .filter((save: RawSave) => !save.personnage?.[0]?.nom_personnage)
          .map((save: RawSave) => save.id_personnage)
          .filter(Boolean);

        const personnageMap = new Map<number, { nom_personnage: string; classe: string }>();
        if (missingPersonnageIds.length > 0) {
          const { data: charFallback } = await supabase
            .from("personnage")
            .select("id, nom_personnage, classe")
            .in("id", missingPersonnageIds);
          if (charFallback) {
            for (const c of charFallback) {
              personnageMap.set(c.id, { nom_personnage: c.nom_personnage, classe: c.classe });
            }
          }
        }

        const formattedSaves: UserSave[] = savesData.map((save: RawSave) => {
          const charData = save.personnage?.[0] || personnageMap.get(save.id_personnage);
          return {
            id: save.id,
            id_utilisateur: save.id_utilisateur,
            id_aventure: save.id_aventure,
            id_personnage: save.id_personnage,
            id_embranchement_actuel: save.id_embranchement_actuel,
            progression: save.progression ?? 0,
            date_sauvegarde: save.date_sauvegarde,
            aventure_titre: save.aventure?.[0]?.titre || titleMap.get(save.id_aventure) || "Aventure inconnue",
            personnage_nom: charData?.nom_personnage,
            personnage_classe: charData?.classe,
            status: (save.progression ?? 0) >= 100 ? "completed" as const : "in-progress" as const,
          };
        });
        if (isCancelled()) return;
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

      if (isCancelled()) return;
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
        .select("id", { count: "exact" })
        .eq("id_utilisateur", uid);

      const { data: charactersData } = await supabase
        .from("personnage")
        .select("*")
        .eq("id_utilisateur", uid);

      if (isCancelled()) return;
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

      if (isCancelled()) return;
      setStats({
        storiesPlayed: savesData?.length || 0,
        storiesCreated: creationsData?.length || 0,
        likes: votesCount || 0,
        trophies: getPrestigeTier(profileData?.meilleur_niveau ?? profileData?.niveau ?? 1),
      });

      const achievements = calculateAchievements({
        storiesPlayed: savesData?.length || 0,
        charactersCreated: charactersData?.length ?? 0,
        votes: votesCount || 0,
        storiesCreated: creationsData?.length || 0,
        totalLikes:
          creationsData?.reduce((sum, c) => sum + (c.popularite || 0), 0) || 0,
        level: profileData?.niveau || 1,
      });
      if (!isCancelled()) setUserAchievements(achievements);
    } catch {
      if (!isCancelled()) setDataError("Impossible de charger vos données. Réessayez plus tard.");
    } finally {
      if (!isCancelled()) {
        initialLoadDone.current = true;
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!userId || !enabled) return;
    let cancelled = false;
    loadData(userId, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [userId, enabled, refreshKey, loadData]);

  useEffect(() => {
    if (!enabled) return;
    const handler = () => refresh();
    window.addEventListener(PROFILE_REFRESH_EVENT, handler);
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener(PROFILE_REFRESH_EVENT, handler);
      window.removeEventListener("focus", handler);
    };
  }, [enabled, refresh]);

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
