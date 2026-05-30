"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getPoolAbilityNames } from "@/lib/abilities";
import { applyXpGain, saveCharacterProgress, updateUserXp } from "@/lib/xp";
import type { Character, CharacterClass } from "@/types";
import { CHARACTER_CLASSES } from "@/types/character";

// ============================================================
// useCharacter — Chargement personnage, capacités, progression
// ============================================================

interface UseCharacterProps {
  personnageId: string | null;
  userId: number | null;
}

interface UseCharacterReturn {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  availableAbilities: string[];
  usedAbilities: string[];
  setUsedAbilities: React.Dispatch<React.SetStateAction<string[]>>;
  loadCharacterProgress: () => Promise<{
    niveau: number;
    stats: {
      force: number;
      agility: number;
      magie: number;
      endurance: number;
    };
    experience: number;
  } | null>;
  saveCharacterStats: (
    niveau: number,
    stats: {
      force: number;
      agility: number;
      magie: number;
      endurance: number;
    },
    experience: number,
  ) => Promise<void>;
  characterIdNum: number | null;
  completeAdventure: (
    historyLength: number,
    userId: number,
  ) => Promise<void>;
}

export function useCharacter({
  personnageId,
  userId,
}: UseCharacterProps): UseCharacterReturn {
  const [character, setCharacter] = useState<Character | null>(null);
  const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
  const [usedAbilities, setUsedAbilities] = useState<string[]>([]);

  const characterIdNum = personnageId
    ? parseInt(personnageId, 10)
    : null;

  // Chargement du personnage depuis la BDD
  useEffect(() => {
    if (!personnageId) return;

    let cancelled = false;

    supabase
      .from("personnage")
      .select("*")
      .eq("id", personnageId)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return;

        const classe = data.classe as CharacterClass;
        const defaultStats =
          CHARACTER_CLASSES[classe]?.baseStats || {
            force: 5,
            agility: 5,
            magie: 5,
            endurance: 5,
          };

        const characterWithStats: Character = {
          ...data,
          stats: data.stats || defaultStats,
          points_vie_max: data.points_vie_max || 100,
          experience: data.experience || 0,
        };

        setCharacter(characterWithStats);
      });

    return () => {
      cancelled = true;
    };
  }, [personnageId]);

  // Chargement des capacités disponibles depuis la classe
  useEffect(() => {
    if (!character?.classe) return;
    const classAbilities = getPoolAbilityNames(
      character.classe as CharacterClass,
    );
    setAvailableAbilities(classAbilities.slice(0, 3));
  }, [character?.classe]);

  // Récupérer la progression depuis la BDD
  const loadCharacterProgress = useCallback(async () => {
    if (!userId || !characterIdNum) return null;

    const { data } = await supabase
      .from("personnage")
      .select(
        "niveau, force_personnage, agility_personnage, magie_personnage, endurance_personnage, experience",
      )
      .eq("id", characterIdNum)
      .maybeSingle();

    if (data) {
      return {
        niveau: data.niveau ?? 1,
        stats: {
          force: data.force_personnage ?? 5,
          agility: data.agility_personnage ?? 5,
          magie: data.magie_personnage ?? 5,
          endurance: data.endurance_personnage ?? 5,
        },
        experience: data.experience ?? 0,
      };
    }
    return null;
  }, [userId, characterIdNum]);

  // Sauvegarder les stats en BDD
  const saveCharacterStats = useCallback(
    async (
      niveau: number,
      stats: {
        force: number;
        agility: number;
        magie: number;
        endurance: number;
      },
      experience: number,
    ) => {
      if (!userId || !characterIdNum) return;

      await supabase
        .from("personnage")
        .update({
          niveau,
          force_personnage: stats.force,
          agility_personnage: stats.agility,
          magie_personnage: stats.magie,
          endurance_personnage: stats.endurance,
          experience,
        })
        .eq("id", characterIdNum);
    },
    [userId, characterIdNum],
  );

  // Fin d'aventure : calcul XP, level up, sauvegarde BDD
  const completeAdventure = useCallback(
    async (historyLength: number, userId: number) => {
      if (!characterIdNum || !character) return;

      const progress = (await loadCharacterProgress()) || {
        niveau: character.niveau ?? 1,
        stats: { force: 5, agility: 5, magie: 5, endurance: 5 },
        experience: 0,
      };

      const xpPerChoice = 30;
      const endBonus = 100;
      const xpGained = historyLength * xpPerChoice + endBonus;

      const basePvMax = character.points_vie_max || 100;
      const result = applyXpGain(progress.niveau, progress.experience, xpGained, basePvMax);

      const newStats = {
        force: (progress.stats?.force ?? 5) + (result.statBonuses.force ?? 0),
        agility: (progress.stats?.agility ?? 5) + (result.statBonuses.agility ?? 0),
        magie: (progress.stats?.magie ?? 5) + (result.statBonuses.magie ?? 0),
        endurance: (progress.stats?.endurance ?? 5) + (result.statBonuses.endurance ?? 0),
      };

      const newPv = result.leveledUp
        ? Math.min(character.points_vie + (result.newMaxPv - basePvMax), result.newMaxPv)
        : character.points_vie;

      await saveCharacterProgress(characterIdNum, result.newLevel, result.newExperience, newStats, newPv);
      await updateUserXp(userId, "aventure", xpGained);

      setCharacter((prev) =>
        prev
          ? {
              ...prev,
              niveau: result.newLevel,
              stats: newStats,
              experience: result.newExperience,
              points_vie: newPv,
              points_vie_max: result.newMaxPv,
            }
          : prev,
      );
    },
    [character, characterIdNum, loadCharacterProgress],
  );

  return {
    character,
    setCharacter,
    availableAbilities,
    usedAbilities,
    setUsedAbilities,
    loadCharacterProgress,
    saveCharacterStats,
    characterIdNum,
    completeAdventure,
  };
}
