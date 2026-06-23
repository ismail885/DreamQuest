"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  playerAttack,
  enemyAttack,
  playerDefense,
  createCombatState,
  executeAbility,
  applyPoisonDamage,
  updateCombatStatus,
  updateCooldowns,
  updateEnemyStatus,
  MANA_REGEN_PER_TURN,
  type CombatState,
  type CombatAbility,
} from "@/lib/combat";
import { applyXpGain, saveCharacterProgress, updateUserXp } from "@/lib/xp";
import type { Character } from "@/types";

// useCombat — Gère l'état du combat, les actions joueur,
//             le timer ennemi, et la gestion de l'XP.

interface UseCombatProps {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  userId: number | null;
  onCombatEnd?: (won: boolean) => void;
  damageMultiplier?: number;
}

interface UseCombatReturn {
  inCombat: boolean;
  combatState: CombatState | null;
  startCombat: (enemyLevel?: number) => void;
  handleCombatAttack: () => void;
  handleCombatDefend: () => void;
  handleCombatFlee: () => void;
  handleCombatAbility: (ability: CombatAbility) => void;
  handleCombatEnd: () => void;
}

export function useCombat({
  character,
  setCharacter,
  userId,
  onCombatEnd,
  damageMultiplier = 1,
}: UseCombatProps): UseCombatReturn {
  const [inCombat, setInCombat] = useState(false);
  const [combatState, setCombatState] = useState<CombatState | null>(null);

  const getPlayerStats = useCallback(
    () => ({
      force: character?.stats?.force || 0,
      agility: character?.stats?.agility || 0,
      magie: character?.stats?.magie || 0,
      endurance: character?.stats?.endurance || 0,
    }),
    [character?.stats],
  );

  const startCombat = useCallback(
    (enemyLevel?: number) => {
      if (!character) return;
      const level = enemyLevel ?? (character.niveau || 1);
      const manaMax = 50 + level * 5;
      const newCombat = createCombatState(
        character.points_vie_max || 100,
        manaMax,
        level,
      );
      setCombatState(newCombat);
      setInCombat(true);
    },
    [character],
  );

  const handleCombatAttack = useCallback(() => {
    if (!combatState || !character || !combatState.enemy) return;

    const playerStats = getPlayerStats();
    const result = playerAttack(
      playerStats,
      combatState.enemy,
      combatState.status,
    );
    const effectiveDmg = damageMultiplier !== 1
      ? Math.max(1, Math.round(result.dmg * damageMultiplier))
      : result.dmg;
    const newEnemyPv = Math.max(0, combatState.enemy.pv - effectiveDmg);
    const newLog = [...combatState.log, result.log];

    if (newEnemyPv <= 0) {
      setCharacter(
        (prev) =>
          prev ? { ...prev, points_vie: prev.points_vie } : null,
      );
      setCombatState({
        ...combatState,
        enemy: { ...combatState.enemy, pv: 0 },
        log: newLog,
        won: true,
      });
    } else {
      setCombatState({
        ...combatState,
        enemy: { ...combatState.enemy, pv: newEnemyPv },
        log: newLog,
        turn: "enemy",
      });
    }
  }, [combatState, character, getPlayerStats, setCharacter, damageMultiplier]);

  const handleCombatDefend = useCallback(() => {
    if (!combatState || !character) return;

    const playerStats = getPlayerStats();
    const { reduction } = playerDefense(playerStats, combatState.status);
    const result = enemyAttack(
      combatState.enemy!,
      combatState.status,
      playerStats.agility,
    );
    const dmg = Math.max(1, result.dmg - reduction);
    const newPlayerPv = Math.max(0, combatState.playerPv - dmg);
    const newLog = [
      ...combatState.log,
      result.log,
      `Tu pare! -${reduction} dégats.`,
    ];

    setCharacter(
      (prev) => (prev ? { ...prev, points_vie: newPlayerPv } : null),
    );
    setCombatState({
      ...combatState,
      playerPv: newPlayerPv,
      log: newLog,
      turn: "player",
      status: updateCombatStatus(combatState.status),
      playerMana: Math.min(
        combatState.playerManaMax,
        combatState.playerMana + MANA_REGEN_PER_TURN,
      ),
    });
  }, [combatState, character, getPlayerStats, setCharacter]);

  const handleCombatFlee = useCallback(() => {
    if (!combatState || !character) return;

    const playerStats = getPlayerStats();
    const success = Math.random() < playerStats.agility / 100 + 0.3;
    if (success) {
      setCombatState({
        ...combatState,
        fled: true,
        log: [...combatState.log, "Tu fuis le combat!"],
      });
    } else {
      const result = enemyAttack(
        combatState.enemy!,
        combatState.status,
        playerStats.agility,
      );
      const newPlayerPv = Math.max(0, combatState.playerPv - result.dmg);
      setCharacter(
        (prev) => (prev ? { ...prev, points_vie: newPlayerPv } : null),
      );
      setCombatState({
        ...combatState,
        playerPv: newPlayerPv,
        log: [...combatState.log, result.log, "Fuite échouée!"],
        turn: "player",
      });
    }
  }, [combatState, character, getPlayerStats, setCharacter]);

  const handleCombatAbility = useCallback(
    (ability: CombatAbility) => {
      if (!combatState || !character || !combatState.enemy) return;
      if (combatState.turn !== "player") return;
      if (combatState.playerMana < ability.manaCost) {
        setCombatState(
          (prev) =>
            prev
              ? { ...prev, log: [...prev.log, "Pas assez de mana!"] }
              : null,
        );
        return;
      }

      const playerStats = getPlayerStats();
      const result = executeAbility(
        ability.id,
        character.classe || "guerrier",
        playerStats,
        combatState.enemy,
        combatState.status,
        combatState.playerPv,
        combatState.playerMana,
        combatState.cooldowns,
      );

      if (!result.success) {
        setCombatState(
          (prev) =>
            prev ? { ...prev, log: [...prev.log, result.log] } : null,
        );
        return;
      }

      // Gérer les capacités spéciales (ex: fuite)
      if (result.specialFlag === 'fled') {
        setCombatState({
          ...combatState,
          log: [...combatState.log, result.log],
          fled: true,
        });
        return;
      }

      let newEnemyPv = combatState.enemy.pv;
      const newPlayerPv = Math.min(
        combatState.playerPvMax,
        combatState.playerPv + (result.heal || 0),
      );
      const newLog = [...combatState.log, result.log];
      const newStatus = result.newStatus || combatState.status;
      let newEnemyStatus = combatState.enemyStatus;

      if (result.damage) {
        const effectiveAbilityDmg = damageMultiplier !== 1
          ? Math.max(1, Math.round(result.damage * damageMultiplier))
          : result.damage;
        newEnemyPv = Math.max(0, combatState.enemy.pv - effectiveAbilityDmg);
        newEnemyStatus = [
          ...newEnemyStatus,
          ...(result.newEnemyStatus || []),
        ];
      }

      if (newEnemyPv <= 0) {
        setCharacter(
          (prev) =>
            prev ? { ...prev, points_vie: newPlayerPv } : null,
        );
        setCombatState({
          ...combatState,
          enemy: { ...combatState.enemy, pv: 0 },
          playerPv: newPlayerPv,
          playerMana: combatState.playerMana - result.manaUsed,
          log: newLog,
          won: true,
          status: newStatus,
          enemyStatus: newEnemyStatus,
          cooldowns: result.newCooldowns ?? combatState.cooldowns,
        });
        return;
      }

      setCombatState({
        ...combatState,
        enemy: { ...combatState.enemy, pv: newEnemyPv },
        playerPv: newPlayerPv,
        playerMana: combatState.playerMana - result.manaUsed,
        log: newLog,
        turn: "enemy",
        status: newStatus,
        enemyStatus: newEnemyStatus,
        cooldowns: result.newCooldowns ?? combatState.cooldowns,
      });
    },
    [combatState, character, getPlayerStats, setCharacter, damageMultiplier],
  );

  const handleCombatEnd = useCallback(async () => {
    if (!character) return;

    if (combatState?.won) {
      const baseXp = combatState.enemy?.xpReward || 0;
      const enemyLevel = combatState.enemy?.level || 1;
      const levelRatio = Math.max(1, (character.niveau || 1) / enemyLevel);
      const xpGain = Math.floor(baseXp * levelRatio);
      const currentXp = character.experience ?? 0;
      const currentLevel = character.niveau ?? 1;
      const basePvMax = character.points_vie_max || 100;

      const levelResult = applyXpGain(
        currentLevel,
        currentXp,
        xpGain,
        basePvMax,
      );

      const newStats = {
        force:
          (character.stats?.force ?? 5) +
          (levelResult.statBonuses.force ?? 0),
        agility:
          (character.stats?.agility ?? 5) +
          (levelResult.statBonuses.agility ?? 0),
        magie:
          (character.stats?.magie ?? 5) +
          (levelResult.statBonuses.magie ?? 0),
        endurance:
          (character.stats?.endurance ?? 5) +
          (levelResult.statBonuses.endurance ?? 0),
      };

      const newPv = levelResult.leveledUp
        ? Math.min(
            character.points_vie +
              (levelResult.newMaxPv - basePvMax),
            levelResult.newMaxPv,
          )
        : character.points_vie;

      if (character.id) {
        await saveCharacterProgress(
          character.id,
          levelResult.newLevel,
          levelResult.newExperience,
          newStats,
          newPv,
        );
      }
      if (userId) {
        await updateUserXp(userId, "combat", xpGain);
      }

      setCharacter(
        (prev) =>
          prev
            ? {
                ...prev,
                niveau: levelResult.newLevel,
                stats: newStats,
                experience: levelResult.newExperience,
                points_vie: newPv,
                points_vie_max: levelResult.newMaxPv,
              }
            : null,
      );
    } else {
      // Défaite : ranime à pleins PV. Fuite : conserve les PV courants.
      const finalPv = combatState?.lost
        ? (character.points_vie_max || 100)
        : character.points_vie;
      if (character.id && finalPv !== undefined) {
        await supabase
          .from("personnage")
          .update({ points_vie: finalPv })
          .eq("id", character.id);
        setCharacter((prev) => (prev ? { ...prev, points_vie: finalPv } : prev));
      }
    }

    setInCombat(false);
    setCombatState(null);
    onCombatEnd?.(combatState?.won ?? false);
  }, [character, combatState, userId, setCharacter, onCombatEnd]);

  useEffect(() => {
    if (!combatState || !character || !combatState.enemy) return;
    if (combatState.turn !== "enemy" || combatState.won || combatState.fled)
      return;

    const timer = setTimeout(() => {
      setCombatState((prev) => {
        if (!prev || !prev.enemy || !character) return prev;

        let currentEnemyPv = prev.enemy.pv;
        let currentPlayerPv = prev.playerPv;
        const logMessages: string[] = [];

              if (prev.enemyStatus.includes("poison")) {
          const poisonResult = applyPoisonDamage(prev.enemy);
          currentEnemyPv = Math.max(
            0,
            currentEnemyPv - poisonResult.dmg,
          );
          logMessages.push(poisonResult.log);

          if (currentEnemyPv <= 0) {
            return {
              ...prev,
              enemy: { ...prev.enemy!, pv: 0 },
              log: [...prev.log, ...logMessages],
              won: true,
              cooldowns: updateCooldowns(prev.cooldowns),
            };
          }
        }

        if (prev.enemyStatus.includes("stunned")) {
          const newStatus = updateEnemyStatus(prev.enemyStatus);
          return {
            ...prev,
            log: [
              ...prev.log,
              `${prev.enemy?.name} est étourdi et passe son tour!`,
            ],
            turn: "player",
            enemyStatus: newStatus,
            playerMana: Math.min(
              prev.playerManaMax,
              prev.playerMana + MANA_REGEN_PER_TURN,
            ),
            status: updateCombatStatus(prev.status),
            cooldowns: updateCooldowns(prev.cooldowns),
          };
        }

        const result = enemyAttack(
          prev.enemy,
          prev.status,
          character.stats?.agility ?? 0,
        );
        const finalDmg = Math.max(1, result.dmg);
        currentPlayerPv = Math.max(0, currentPlayerPv - finalDmg);
        logMessages.push(result.log);

        if (currentPlayerPv !== prev.playerPv) {
          setCharacter(
            (c) => (c ? { ...c, points_vie: currentPlayerPv } : null),
          );
        }

        if (currentPlayerPv <= 0) {
          return {
            ...prev,
            playerPv: 0,
            log: [
              ...prev.log,
              ...logMessages,
              "Tu as été vaincu!",
            ],
            won: false,
            lost: true,
            cooldowns: updateCooldowns(prev.cooldowns),
          };
        }

        // Tour joueur avec régénération de mana
        return {
          ...prev,
          enemy: { ...prev.enemy, pv: currentEnemyPv },
          playerPv: currentPlayerPv,
          log: [...prev.log, ...logMessages],
          turn: "player",
          playerMana: Math.min(
            prev.playerManaMax,
            prev.playerMana + MANA_REGEN_PER_TURN,
          ),
          status: updateCombatStatus(prev.status),
          enemyStatus: updateEnemyStatus(prev.enemyStatus),
          cooldowns: updateCooldowns(prev.cooldowns),
        };
      });
    }, 1000);

    return () => clearTimeout(timer);
    // L'effet ne doit se déclencher que lors du changement de tour
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatState?.turn]);

  return {
    inCombat,
    combatState,
    startCombat,
    handleCombatAttack,
    handleCombatDefend,
    handleCombatFlee,
    handleCombatAbility,
    handleCombatEnd,
  };
}

