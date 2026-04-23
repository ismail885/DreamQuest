"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "@/context/AuthContext";
import type { Enemy, CombatState } from "@/lib/combat";
import { getRandomEnemy, playerAttack, enemyAttack, initCombat } from "@/lib/combat";

interface CombatUIProps {
  playerStats: { force: number; agility: number; intelligence: number; endurance: number };
  playerPv: number;
  playerPvMax: number;
  onPlayerHpChange: (hp: number) => void;
  onWin: (xp: number, loot: string) => void;
  onFlee: () => void;
  onClose: () => void;
}

export default function CombatUI({
  playerStats,
  playerPv,
  playerPvMax,
  onPlayerHpChange,
  onWin,
  onFlee,
  onClose,
}: CombatUIProps) {
  const [combat, setCombat] = useState<CombatState>(() => initCombat(playerPvMax, 1));
  const [defending, setDefending] = useState(false);

  const playerAttackAction = useCallback(() => {
    const result = playerAttack(playerStats, combat.enemy!);
    const newEnemyPv = Math.max(0, combat.enemy!.pv - result.dmg);
    const newLog = [...combat.log, result.log];

    if (newEnemyPv <= 0) {
      setCombat({
        ...combat,
        enemy: { ...combat.enemy!, pv: 0 },
        log: newLog,
        won: true,
      });
      onWin(combat.enemy!.xpReward, combat.enemy!.loot || "");
    } else {
      setCombat((c) => ({
        ...c,
        enemy: { ...c.enemy!, pv: newEnemyPv },
        log: newLog,
        turn: "enemy",
      }));
    }
  }, [combat, playerStats, onWin]);

  const defendAction = useCallback(() => {
    const reduction = defending ? 0 : Math.floor((playerStats.agility + playerStats.endurance) / 4);
    setDefending(true);
    setTimeout(() => {
      const result = enemyAttack(combat.enemy!);
      const dmg = Math.max(1, result.dmg - reduction);
      const newPlayerPv = Math.max(0, combat.playerPv - dmg);
      const newLog = [...combat.log, result.log, `Tu pare! Degats reduits de ${reduction}.`];

      setCombat((c) => ({
        ...c,
        playerPv: newPlayerPv,
        log: newLog,
        turn: "player",
      }));
      setDefending(false);
      onPlayerHpChange(newPlayerPv);
    }, 500);
  }, [combat, playerStats, defending, onPlayerHpChange]);

  const fleeAction = useCallback(() => {
    const success = Math.random() < playerStats.agility / 100 + 0.3;
    if (success) {
      setCombat((c) => ({ ...c, fled: true }));
      onFlee();
    } else {
      const result = enemyAttack(combat.enemy!);
      const newPlayerPv = Math.max(0, combat.playerPv - result.dmg);
      setCombat((c) => ({
        ...c,
        playerPv: newPlayerPv,
        log: [...c.log, result.log, "Fuite echouee!"],
        turn: "player",
      }));
      onPlayerHpChange(newPlayerPv);
    }
  }, [combat, playerStats, onPlayerHpChange, onFlee]);

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
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={playerAttackAction}
                  disabled={combat.turn !== "player" || combat.won}
                  className="py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-bold"
                >
                  Attaquer
                </button>
                <button
                  onClick={defendAction}
                  disabled={combat.turn !== "player" || combat.won || defending}
                  className="py-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50"
                >
                  {defending ? "En defense" : "Defense"}
                </button>
                <button
                  onClick={fleeAction}
                  disabled={combat.turn !== "player" || combat.won}
                  className="py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50"
                >
                  Fuir
                </button>
              </div>
            )}

            <div className="bg-[#0a0e1a] rounded-lg p-3 h-32 overflow-y-auto">
              <div className="space-y-1">
                {combat.log.slice(-5).map((line, i) => (
                  <p key={i} className="text-gray-300 text-sm">{line}</p>
                ))}
              </div>
            </div>

            {(combat.won || combat.fled) && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600"
              >
                {combat.won ? `Victoire! +${combat.enemy?.xpReward} XP` : "Combat termine"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}