"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getPoolAbilityNames } from "@/lib/abilities";
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

  return {
    character,
    setCharacter,
    availableAbilities,
    usedAbilities,
    setUsedAbilities,
    loadCharacterProgress,
    saveCharacterStats,
    characterIdNum,
  };
}
