"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Character, ConsequenceEffect } from "@/types";

// useConsequences — Parse et applique les conséquences des choix

export interface ConsequenceImpact {
  hasImpact: boolean;
  isPositive: boolean;
  impactText: string;
  isCombat: boolean;
}

interface UseConsequencesProps {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  startCombat: (enemyLevel?: number) => void;
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
}

interface UseConsequencesReturn {
  lastConsequence: ConsequenceEffect | null;
  showEffect: boolean;
  getConsequenceImpact: (
    consequencesJson: string | null | undefined,
  ) => ConsequenceImpact;
  applyConsequence: (
    choixNum: 1 | 2,
    consequencesJson: string | null | undefined,
  ) => Promise<boolean>;
  parseStatChanges: (
    consequencesJson: string | null | undefined | Record<string, unknown>,
  ) => Record<string, number>;
}

export function useConsequences({
  character,
  setCharacter,
  startCombat,
  loadCharacterProgress,
  saveCharacterStats,
}: UseConsequencesProps): UseConsequencesReturn {
  const [lastConsequence, setLastConsequence] =
    useState<ConsequenceEffect | null>(null);
  const [showEffect, setShowEffect] = useState(false);

  // Référence pour nettoyer le setTimeout si le composant est démonté
  const effectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (effectTimerRef.current) {
        clearTimeout(effectTimerRef.current);
      }
    };
  }, []);

  const getConsequenceImpact = useCallback(
    (
      consequencesJson: string | null | undefined | Record<string, unknown>,
    ): ConsequenceImpact => {
      if (!consequencesJson)
        return {
          hasImpact: false,
          isPositive: true,
          impactText: "",
          isCombat: false,
        };

      try {
        // Si c'est déjà un objet (JSONB retourné par Supabase), l'utiliser directement
        const effect = typeof consequencesJson === 'string' 
          ? JSON.parse(consequencesJson) 
          : consequencesJson;

        if (effect.type === "combat") {
          return {
            hasImpact: true,
            isPositive: false,
            impactText: "Combat!",
            isCombat: true,
          };
        }

        if (
          !effect ||
          (effect.pv === 0 &&
            effect.force === undefined &&
            effect.agility === undefined &&
            effect.magie === undefined &&
            effect.endurance === undefined)
        ) {
          return {
            hasImpact: false,
            isPositive: true,
            impactText: "",
            isCombat: false,
          };
        }

        const impacts: string[] = [];
        let isPositive = true;

        if (effect.pv) {
          impacts.push(
            `${effect.pv > 0 ? "+" : ""}${effect.pv} PV`,
          );
          if (effect.pv < 0) isPositive = false;
        }
        if (effect.force) {
          impacts.push(
            `${effect.force > 0 ? "+" : ""}${effect.force} Force`,
          );
          if (effect.force < 0) isPositive = false;
        }
        if (effect.agility) {
          impacts.push(
            `${effect.agility > 0 ? "+" : ""}${effect.agility} Agilité`,
          );
          if (effect.agility < 0) isPositive = false;
        }
        if (effect.magie) {
          impacts.push(
            `${effect.magie > 0 ? "+" : ""}${effect.magie} Intelligence`,
          );
          if (effect.magie < 0) isPositive = false;
        }
        if (effect.endurance) {
          impacts.push(
            `${effect.endurance > 0 ? "+" : ""}${effect.endurance} Endurance`,
          );
          if (effect.endurance < 0) isPositive = false;
        }

        return {
          hasImpact: impacts.length > 0,
          isPositive,
          impactText: impacts.join(" • "),
          isCombat: false,
        };
      } catch {
        return {
          hasImpact: false,
          isPositive: true,
          impactText: "",
          isCombat: false,
        };
      }
    },
    [],
  );

  const applyConsequence = useCallback(
    async (
      _choixNum: 1 | 2,
      consequencesJson: string | null | undefined | Record<string, unknown>,
    ): Promise<boolean> => {
      if (!character || !consequencesJson) return false;

      let effect: {
        type?: string;
        level?: number;
        pv?: number;
        force?: number;
        agility?: number;
        magie?: number;
        endurance?: number;
        text?: string;
      } | null = null;
      const statChanges: Record<string, number> = {};

      // Si c'est déjà un objet (JSONB retourné par Supabase), l'utiliser directement
      if (typeof consequencesJson === 'object') {
        effect = consequencesJson;
      } else if (typeof consequencesJson === 'string') {
        // Essayer le format JSON d'abord
        try {
          effect = JSON.parse(consequencesJson);
        } catch {
          // Format texte "Stats: force:2,agility:-1"
          if (consequencesJson.includes("Stats:")) {
            const statsMatch = consequencesJson.match(
              /Stats:\s*([\w:,\s+-]+)/,
            );
            if (statsMatch) {
              const statPairs = statsMatch[1].split(",");
              for (const pair of statPairs) {
                const [stat, value] = pair
                  .split(":")
                  .map((s) => s.trim());
                if (stat && value) {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    statChanges[stat] = numValue;
                  }
                }
              }
            }
          }
        }
      }

      if (!effect && Object.keys(statChanges).length === 0)
        return false;

      try {
        if (effect?.type === "combat") {
          // La difficulté suit le niveau du personnage : l'ennemi est au moins à son niveau, plus un écart issu de la difficulté de l'aventure
          const baked = effect.level ?? 0;
          const ecart = baked <= 3 ? 0 : baked <= 6 ? 1 : baked <= 9 ? 2 : 3;
          const enemyLevel = Math.max(1, (character.niveau || 1) + ecart);
          startCombat(enemyLevel);
          return true; // Indique que le combat doit remplacer la navigation
        }

        const statDelta = effect
          ? {
              force: effect.force ?? 0,
              agility: effect.agility ?? 0,
              magie: effect.magie ?? 0,
              endurance: effect.endurance ?? 0,
            }
          : statChanges;

        const newStats = {
          force:
            (character.stats?.force ?? 0) + (statDelta.force ?? 0),
          agility:
            (character.stats?.agility ?? 0) +
            (statDelta.agility ?? 0),
          magie:
            (character.stats?.magie ?? 0) + (statDelta.magie ?? 0),
          endurance:
            (character.stats?.endurance ?? 0) +
            (statDelta.endurance ?? 0),
        };
        const newPv = Math.max(
          0,
          (character.points_vie ?? 0) + (effect?.pv ?? 0),
        );

        if (character.id) {
          await supabase
            .from("personnage")
            .update({ points_vie: newPv })
            .eq("id", character.id);
        }

        setCharacter((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            points_vie: newPv,
            stats: newStats,
          };
        });

        const progress = await loadCharacterProgress();
        const currentExp =
          progress?.experience ?? character.experience ?? 0;
        const currentLevel =
          progress?.niveau ?? character.niveau ?? 1;
        await saveCharacterStats(
          currentLevel,
          newStats,
          currentExp,
        );

        setLastConsequence({
          pv_change: effect?.pv ?? 0,
          force_change: statDelta.force,
          agility_change: statDelta.agility,
          magie_change: statDelta.magie,
          endurance_change: statDelta.endurance,
          text: effect?.text,
        });
        setShowEffect(true);

        if (effectTimerRef.current) {
          clearTimeout(effectTimerRef.current);
        }
        effectTimerRef.current = setTimeout(() => {
          setShowEffect(false);
          effectTimerRef.current = null;
        }, 3000);

        return false;
      } catch {
        return false;
      }
    },
    [
      character,
      setCharacter,
      startCombat,
      loadCharacterProgress,
      saveCharacterStats,
    ],
  );

  return {
    lastConsequence,
    showEffect,
    getConsequenceImpact,
    applyConsequence,
    parseStatChanges: (consequencesJson: string | null | undefined | Record<string, unknown>): Record<string, number> => {
      if (!consequencesJson) return {};
      
      try {
        const effect = typeof consequencesJson === 'string' 
          ? JSON.parse(consequencesJson) 
          : consequencesJson;
        
        const statChanges: Record<string, number> = {};
        
        if (effect.pv && effect.pv !== 0) statChanges.points_vie = effect.pv;
        if (effect.force && effect.force !== 0) statChanges.force = effect.force;
        if (effect.agility && effect.agility !== 0) statChanges.agility = effect.agility;
        if (effect.magie && effect.magie !== 0) statChanges.magie = effect.magie;
        if (effect.endurance && effect.endurance !== 0) statChanges.endurance = effect.endurance;
        
        return statChanges;
      } catch {
        return {};
      }
    },
  };
}

