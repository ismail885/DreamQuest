"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CombatState } from "@/lib/combat";
import { playerAttack, enemyAttack, playerDefense, createCombatState, applyPoisonDamage, updateEnemyStatus, updateCombatStatus, updateCooldowns, regenerateMana, executeAbility, getAbilitiesForClass } from "@/lib/combat";

interface CombatUIProps {
  playerStats: { force: number; agility: number; magie: number; endurance: number };
  playerPvMax: number;
  characterClass?: string;
  onPlayerHpChange: (hp: number) => void;
  onWin: (xp: number, loot: string) => void;
  onFlee: () => void;
  onClose: () => void;
}

export default function CombatUI({
  playerStats,
  playerPvMax,
  characterClass = "guerrier",
  onPlayerHpChange,
  onWin,
  onFlee,
  onClose,
}: CombatUIProps) {
 const [combat, setCombat] = useState<CombatState>(() => createCombatState(playerPvMax, 50, 1));
 const [defending, setDefending] = useState(false);

  // Tour de l'ennemi : poison, attaque, régénération mana
  useEffect(() => {
    if (combat.turn !== "enemy" || combat.won || combat.fled || defending) return;

    const timeout = setTimeout(() => {
      setCombat((c) => {
        if (c.turn !== "enemy" || c.won || c.fled) return c;

        const newLog = [...c.log];
        let enemyPv = c.enemy!.pv;

        // Dégâts de poison
        if (c.enemyStatus.includes("poison")) {
          const poison = applyPoisonDamage(c.enemy!);
          enemyPv = Math.max(0, enemyPv - poison.dmg);
          newLog.push(poison.log);
        }

        // Vérifier si l'ennemi est mort du poison
        if (enemyPv <= 0) {
          return {
            ...c,
            enemy: { ...c.enemy!, pv: 0 },
            log: newLog,
            won: true,
            cooldowns: updateCooldowns(c.cooldowns),
          };
        }

        // Vérifier si l'ennemi est étourdi
        const isStunned = c.enemyStatus.includes("stunned");

        let playerPv = c.playerPv;
        if (!isStunned) {
          // Attaque ennemie
          const attack = enemyAttack(c.enemy!, c.status, playerStats.agility);
          playerPv = Math.max(0, c.playerPv - attack.dmg);
          newLog.push(attack.log);
        } else {
          newLog.push(`${c.enemy!.name} est étourdi et ne peut pas attaquer!`);
        }

        // Mise à jour des buffs du joueur (début du prochain tour)
        const newPlayerStatus = updateCombatStatus(c.status);

        // Régénération de mana
        const playerMana = regenerateMana(c.playerMana, c.playerManaMax);

        // Mise à jour des statuts ennemis
        const enemyStatus = updateEnemyStatus(c.enemyStatus);

        onPlayerHpChange(playerPv);

        if (playerPv <= 0) {
          newLog.push("Tu as été vaincu...");
          return {
            ...c,
            enemy: { ...c.enemy!, pv: enemyPv },
            playerPv: 0,
            playerMana,
            log: newLog,
            won: false,
            lost: true,
            turn: "player",
            status: newPlayerStatus,
            enemyStatus,
            cooldowns: updateCooldowns(c.cooldowns),
          };
        }

        return {
          ...c,
          enemy: { ...c.enemy!, pv: enemyPv },
          playerPv,
          playerMana,
          log: newLog,
          turn: "player",
          status: newPlayerStatus,
          enemyStatus,
          cooldowns: updateCooldowns(c.cooldowns),
        };
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [combat.turn, combat.won, combat.fled, defending, onPlayerHpChange, playerStats.agility]);

  const handleAbility = useCallback((abilityId: string) => {
  if (combat.turn !== "player" || combat.won || combat.lost) return;

  const result = executeAbility(
    abilityId,
    characterClass,
    playerStats,
    combat.enemy!,
    combat.status,
    combat.playerPv,
    combat.playerMana,
    combat.cooldowns
  );

  if (!result.success) {
    setCombat((c) => ({ ...c, log: [...c.log, result.log] }));
    return;
  }

  setCombat((c) => {
    const newLog = [...c.log, result.log];
    let newEnemyPv = c.enemy!.pv;
    let newPlayerPv = c.playerPv;
    let newStatus = c.status;

    if (result.damage) {
      newEnemyPv = Math.max(0, newEnemyPv - result.damage);
    }

    if (result.heal) {
      newPlayerPv = Math.min(c.playerPvMax, newPlayerPv + result.heal);
    }

    if (result.newStatus) {
      newStatus = result.newStatus;
    }

    const newEnemyStatus = result.newEnemyStatus
      ? [...c.enemyStatus, ...result.newEnemyStatus]
      : c.enemyStatus;

    if (newEnemyPv <= 0) {
      onWin(c.enemy!.xpReward, c.enemy!.loot || "");
      return {
        ...c,
        enemy: { ...c.enemy!, pv: 0 },
        playerPv: newPlayerPv,
        playerMana: c.playerMana - result.manaUsed,
        log: newLog,
        won: true,
        status: newStatus,
        enemyStatus: newEnemyStatus,
        cooldowns: result.newCooldowns ?? c.cooldowns,
      };
    }

    return {
      ...c,
      enemy: { ...c.enemy!, pv: newEnemyPv },
      playerPv: newPlayerPv,
      playerMana: c.playerMana - result.manaUsed,
      log: newLog,
      turn: "enemy",
      status: newStatus,
      enemyStatus: newEnemyStatus,
      cooldowns: result.newCooldowns ?? c.cooldowns,
    };
  });
  }, [combat, characterClass, playerStats, onWin]);

  const playerAttackAction = useCallback(() => {
 const result = playerAttack(playerStats, combat.enemy!, combat.status);
 const newEnemyPv = Math.max(0, combat.enemy!.pv - result.dmg);
 const newLog = [...combat.log, result.log];

 if (newEnemyPv <= 0) {
 setCombat((c) => ({
 ...c,
 enemy: { ...c.enemy!, pv: 0 },
 log: newLog,
 won: true,
 }));
 onWin(combat.enemy!.xpReward, combat.enemy!.loot || "");
 } else {
 setCombat((c) => ({
 ...c,
 enemy: { ...c.enemy!, pv: newEnemyPv },
 log: newLog,
 turn: "enemy",
 }));
 }
 }, [combat.enemy, combat.status, combat.log, playerStats, onWin]);

  const defendAction = useCallback(() => {
  if (defending || combat.turn !== "player") return;
  const { reduction } = defending ? { reduction: 0 } : playerDefense(playerStats, combat.status);
  setDefending(true);
  setTimeout(() => {
  setCombat((c) => {
  if (c.turn !== "player") return c;

  const newLog = [...c.log];

  // Dégâts de poison sur l'ennemi
  let enemyPv = c.enemy!.pv;
  if (c.enemyStatus.includes("poison")) {
  const poison = applyPoisonDamage(c.enemy!);
  enemyPv = Math.max(0, enemyPv - poison.dmg);
  newLog.push(poison.log);
  }

  // Attaque ennemie (réduite par la défense)
  const result = enemyAttack(c.enemy!, c.status, playerStats.agility);
  const dmg = result.dodged ? 0 : Math.max(1, result.dmg - reduction);
  const newPlayerPv = Math.max(0, c.playerPv - dmg);
  if (result.dodged) {
    newLog.push(result.log);
  } else {
    newLog.push(result.log, `Tu pare! Dégâts réduits de ${reduction}.`);
  }

  // Vérifier mort de l'ennemi par poison
  if (enemyPv <= 0) {
  onPlayerHpChange(newPlayerPv);
  return {
  ...c,
  enemy: { ...c.enemy!, pv: 0 },
  playerPv: newPlayerPv,
  log: newLog,
  won: true,
  cooldowns: updateCooldowns(c.cooldowns),
  };
  }

  // Vérifier si le joueur est mort
  if (newPlayerPv <= 0) {
  newLog.push("Tu as été vaincu...");
  onPlayerHpChange(newPlayerPv);
  return {
  ...c,
  enemy: { ...c.enemy!, pv: enemyPv },
  playerPv: 0,
  log: newLog,
  won: false,
  lost: true,
  turn: "player",
  cooldowns: updateCooldowns(c.cooldowns),
  };
  }

  // Mise à jour des buffs du joueur
  const newPlayerStatus = updateCombatStatus(c.status);

  // Régénération de mana
  const playerMana = regenerateMana(c.playerMana, c.playerManaMax);
  const enemyStatus = updateEnemyStatus(c.enemyStatus);

  onPlayerHpChange(newPlayerPv);
  return {
  ...c,
  enemy: { ...c.enemy!, pv: enemyPv },
  playerPv: newPlayerPv,
  playerMana,
  log: newLog,
  turn: "player",
  status: newPlayerStatus,
  enemyStatus,
  cooldowns: updateCooldowns(c.cooldowns),
  };
  });
  setDefending(false);
  }, 500);
  }, [combat, playerStats, defending, onPlayerHpChange]);

  const fleeAction = useCallback(() => {
  const success = Math.random() < playerStats.agility / 100 + 0.3;
  if (success) {
  setCombat((c) => ({ ...c, fled: true }));
  onFlee();
  } else {
  setCombat((c) => {
  if (c.turn !== "player") return c;

  const newLog = [...c.log];

  // Dégâts de poison sur l'ennemi
  let enemyPv = c.enemy!.pv;
  if (c.enemyStatus.includes("poison")) {
  const poison = applyPoisonDamage(c.enemy!);
  enemyPv = Math.max(0, enemyPv - poison.dmg);
  newLog.push(poison.log);
  }

  const result = enemyAttack(c.enemy!, c.status, playerStats.agility);
  const newPlayerPv = Math.max(0, c.playerPv - result.dmg);
  newLog.push(result.log, result.dodged ? "Fuite échouée mais tu esquives!" : "Fuite échouée!");

  // Vérifier mort de l'ennemi par poison
  if (enemyPv <= 0) {
  onPlayerHpChange(newPlayerPv);
  return {
  ...c,
  enemy: { ...c.enemy!, pv: 0 },
  playerPv: newPlayerPv,
  log: newLog,
  won: true,
  cooldowns: updateCooldowns(c.cooldowns),
  };
  }

  // Vérifier si le joueur est mort
  if (newPlayerPv <= 0) {
  newLog.push("Tu as été vaincu...");
  onPlayerHpChange(newPlayerPv);
  return {
  ...c,
  playerPv: 0,
  log: newLog,
  won: false,
  lost: true,
  turn: "player",
  cooldowns: updateCooldowns(c.cooldowns),
  };
  }

  // Mise à jour des buffs du joueur
  const newPlayerStatus = updateCombatStatus(c.status);

  // Régénération de mana
  const playerMana = regenerateMana(c.playerMana, c.playerManaMax);
  const enemyStatus = updateEnemyStatus(c.enemyStatus);

  onPlayerHpChange(newPlayerPv);
  return {
  ...c,
  playerPv: newPlayerPv,
  playerMana,
  log: newLog,
  turn: "player",
  status: newPlayerStatus,
  enemyStatus,
  cooldowns: updateCooldowns(c.cooldowns),
  };
  });
  }
  }, [playerStats, onPlayerHpChange, onFlee]);

 return (
 <AnimatePresence>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
 >
 <div className="bg-[#0d1526] border border-red-500/50 rounded-xl max-w-lg w-full overflow-hidden">
 <div className="bg-red-900/30 border-b border-red-500/30 p-3 text-center">
 <h2 className="text-red-400 font-bold text-lg">COMBAT</h2>
 </div>

 <div className="p-4 space-y-4">
 <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-white font-bold">Toi</div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden w-32">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                style={{ width: `${(combat.playerPv / combat.playerPvMax) * 100}%` }}
              />
            </div>
            <div className="text-gray-400 text-sm">{combat.playerPv} / {combat.playerPvMax} PV</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-2 w-16 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-300 transition-all"
                  style={{ width: `${(combat.playerMana / combat.playerManaMax) * 100}%` }}
                />
              </div>
              <span className="text-blue-400 text-xs">{combat.playerMana}/{combat.playerManaMax} PM</span>
            </div>
          </div>
 <div className="text-3xl">VS</div>
 <div className="flex-1 text-right">
 <div className="text-red-400 font-bold">{combat.enemy?.name}</div>
 <div className="h-4 bg-gray-700 rounded-full overflow-hidden w-32 ml-auto">
 <div
 className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all"
 style={{ width: `${((combat.enemy?.pv || 0) / (combat.enemy?.pvMax || 1)) * 100}%` }}
 />
 </div>
 <div className="text-gray-400 text-sm">{combat.enemy?.pv} / {combat.enemy?.pvMax} PV</div>
 </div>
 </div>

 <p className="text-gray-300 text-sm">{combat.enemy?.description}</p>

  {combat.enemy && (
  <>
  <div className="grid grid-cols-3 gap-2">
  <button
  onClick={playerAttackAction}
  disabled={combat.turn !== "player" || combat.won || combat.lost}
  className="py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-bold"
  >
  Attaquer
  </button>
  <button
  onClick={defendAction}
  disabled={combat.turn !== "player" || combat.won || combat.lost || defending}
  className="py-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50"
  >
  {defending ? "En defense" : "Defense"}
  </button>
  <button
  onClick={fleeAction}
  disabled={combat.turn !== "player" || combat.won || combat.lost}
  className="py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50"
  >
  Fuir
  </button>
  </div>

  {/* Capacités spéciales */}
  <div className="grid grid-cols-2 gap-2">
  {getAbilitiesForClass(characterClass).map((ability) => {
  const inCooldown = (combat.cooldowns[ability.id] || 0) > 0;
  const enoughMana = combat.playerMana >= ability.manaCost;
  return (
  <button
  key={ability.id}
  onClick={() => handleAbility(ability.id)}
  disabled={combat.turn !== "player" || combat.won || combat.lost || inCooldown || !enoughMana}
  className={`py-2 px-3 rounded-lg border text-sm transition-all ${
  inCooldown
  ? "bg-gray-800/50 border-gray-600/50 text-gray-500"
  : enoughMana
  ? "bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30"
  : "bg-gray-800/50 border-gray-600/50 text-gray-500"
  } disabled:opacity-50`}
  title={ability.description}
  >
  <div className="font-semibold">{ability.name}</div>
  <div className="text-xs opacity-70">{ability.manaCost} PM</div>
  </button>
  );
  })}
  </div>
  </>
  )}

 <div className="bg-[#070b15] rounded-lg p-3 h-32 overflow-y-auto">
 <div className="space-y-1">
 {combat.log.slice(-5).map((line, i) => (
 <p key={i} className="text-gray-300 text-sm">{line}</p>
 ))}
 </div>
 </div>

  {(combat.won || combat.lost || combat.fled) && (
  <button
  onClick={onClose}
  className={`w-full py-3 text-white rounded-lg font-bold hover:opacity-80 ${
  combat.won ? "bg-cyan-500" : combat.lost ? "bg-red-600" : "bg-gray-600"
  }`}
  >
  {combat.won
  ? `Victoire! +${combat.enemy?.xpReward} XP`
  : combat.lost
  ? "Défaite... Tu as été vaincu"
  : "Combat terminé"}
  </button>
  )}
 </div>
 </div>
 </motion.div>
 </AnimatePresence>
 );
}