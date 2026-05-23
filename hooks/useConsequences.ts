"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Character, ConsequenceEffect } from "@/types";

// ============================================================
// useConsequences — Parse et applique les conséquences des choix
// ============================================================

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
  characterIdNum: number | null;
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
}

export function useConsequences({
  character,
  setCharacter,
  startCombat,
  loadCharacterProgress,
  saveCharacterStats,
  characterIdNum,
}: UseConsequencesProps): UseConsequencesReturn {
  const [lastConsequence, setLastConsequence] =
    useState<ConsequenceEffect | null>(null);
  const [showEffect, setShowEffect] = useState(false);

  // Référence pour nettoyer le setTimeout si le composant est démonté
  const effectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage du timer au démontage
  useEffect(() => {
    return () => {
      if (effectTimerRef.current) {
        clearTimeout(effectTimerRef.current);
      }
    };
  }, []);

  // Parse le JSON de conséquence pour afficher l'impact
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

        // Détecter le type combat
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

  // Appliquer une conséquence : combat, stats, ou les deux
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
        // Gérer le combat
        if (effect?.type === "combat") {
          const enemyLevel =
            effect.level || character.niveau || 1;
          startCombat(enemyLevel);
          return true; // Indique que le combat doit remplacer la navigation
        }

        // Appliquer les changements de stats (JSON ou format texte)
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

        // Mise à jour rapide des PV en BDD
        if (character.id) {
          await supabase
            .from("personnage")
            .update({ points_vie: newPv })
            .eq("id", character.id);
        }

        // Mettre à jour le state local
        setCharacter((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            points_vie: newPv,
            stats: newStats,
          };
        });

        // Sauvegarder les stats complètes en BDD
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

        // Afficher l'effet visuel
        setLastConsequence({
          pv_change: effect?.pv ?? 0,
          force_change: statDelta.force,
          agility_change: statDelta.agility,
          magie_change: statDelta.magie,
          endurance_change: statDelta.endurance,
          text: effect?.text,
        });
        setShowEffect(true);

        // Nettoyer le timer précédent
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
  };
}
