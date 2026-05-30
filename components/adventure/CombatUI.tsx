"use client";

import { motion } from "framer-motion";
import { Swords, Shield, Trophy, Zap } from "lucide-react";
import { getAbilitiesForClass, type CombatState } from "@/lib/combat";
import type { Character } from "@/types";

interface CombatUIProps {
  combatState: CombatState;
  character: Character;
  onAttack: () => void;
  onDefend: () => void;
  onFlee: () => void;
  onAbility: (ability: {
    id: string;
    name: string;
    description: string;
    manaCost: number;
    type: "attack" | "defense" | "special";
    cooldown: number;
  }) => void;
  onEnd: () => void;
}

export default function CombatUI({
  combatState,
  character,
  onAttack,
  onDefend,
  onFlee,
  onAbility,
  onEnd,
}: CombatUIProps) {
  const enemy = combatState.enemy;
  if (!enemy) return null;

  const playerPvRatio = combatState.playerPv / combatState.playerPvMax;
  const enemyPvRatio = enemy.pv / enemy.pvMax;
  const playerManaRatio = combatState.playerMana / combatState.playerManaMax;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-red-500/30 rounded-[10px] p-5 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <Swords className="w-5 h-5 text-red-400" />
        <h2 className="text-red-400 font-bold text-lg">COMBAT</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 items-center">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-sm">{character.nom_personnage || "Toi"}</span>
            <span className="text-gray-400 text-xs">
              {combatState.status.buff_force > 0 && <span className="text-orange-400 mr-2">Force+{combatState.status.buff_force}</span>}
              {combatState.status.buff_agility > 0 && <span className="text-green-400 mr-2">Agilité+{combatState.status.buff_agility}</span>}
              {combatState.status.buff_defense > 0 && <span className="text-blue-400">Bouclier</span>}
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
              style={{ width: `${playerPvRatio * 100}%` }}
              layout
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{combatState.playerPv} / {combatState.playerPvMax} PV</span>
            <span className="text-blue-400">{combatState.playerMana} PM</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
              style={{ width: `${playerManaRatio * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl mb-1">⚔️</div>
          <div className="text-2xl font-bold text-gray-500">VS</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-semibold text-sm">{enemy.name}</span>
            {enemy.level && <span className="text-gray-500 text-xs">Niv.{enemy.level}</span>}
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
              style={{ width: `${enemyPvRatio * 100}%` }}
              layout
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{enemy.pv} / {enemy.pvMax} PV</span>
          </div>
        </div>
      </div>

      {enemy.description && (
        <p className="text-gray-500 text-xs italic">{enemy.description}</p>
      )}

      {!combatState.won && !combatState.lost && !combatState.fled && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAttack}
              disabled={combatState.turn !== "player"}
              className="flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-[10px] hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all"
            >
              <Swords className="w-4 h-4" />
              Attaquer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDefend}
              disabled={combatState.turn !== "player"}
              className="flex items-center justify-center gap-2 py-3 bg-blue-500/10 border border-blue-500/40 text-blue-400 rounded-[10px] hover:bg-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all"
            >
              <Shield className="w-4 h-4" />
              Défense
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onFlee}
              disabled={combatState.turn !== "player"}
              className="flex items-center justify-center gap-2 py-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-[10px] hover:bg-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all"
            >
              <Trophy className="w-4 h-4" />
              Fuir
            </motion.button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">Compétences</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getAbilitiesForClass(character?.classe || "guerrier").map((ability) => {
                const inCooldown = (combatState.cooldowns[ability.id] || 0) > 0;
                const enoughMana = combatState.playerMana >= ability.manaCost;
                const disabled = combatState.turn !== "player" || inCooldown || !enoughMana;
                return (
                  <motion.button
                    key={ability.id}
                    whileHover={disabled ? {} : { scale: 1.02 }}
                    whileTap={disabled ? {} : { scale: 0.98 }}
                    onClick={() => onAbility(ability)}
                    disabled={disabled}
                    title={ability.description}
                    className={`text-left px-3 py-2.5 rounded-[10px] border text-sm transition-all ${
                      inCooldown
                        ? "bg-gray-800/30 border-gray-700/50 text-gray-600 cursor-not-allowed"
                        : !enoughMana
                          ? "bg-gray-800/30 border-gray-700/50 text-gray-600 cursor-not-allowed"
                          : ability.type === "attack"
                            ? "bg-red-500/5 border-red-500/30 text-red-300 hover:bg-red-500/15 hover:border-red-500/50"
                            : ability.type === "defense"
                              ? "bg-blue-500/5 border-blue-500/30 text-blue-300 hover:bg-blue-500/15 hover:border-blue-500/50"
                              : "bg-purple-500/5 border-purple-500/30 text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/50"
                    } disabled:opacity-40`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{ability.name}</span>
                      <span className="text-xs text-gray-500">{ability.manaCost} PM</span>
                    </div>
                    {inCooldown && (
                      <span className="text-xs text-gray-600">Recharge: {combatState.cooldowns[ability.id]} tours</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="bg-[#070b15] rounded-[10px] p-3 h-32 overflow-y-auto space-y-1">
        {combatState.log.slice(-6).map((line, i) => (
          <p key={i} className="text-gray-400 text-sm leading-relaxed">{line}</p>
        ))}
      </div>

      {(combatState.won || combatState.lost || combatState.fled) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnd}
          className={`w-full py-3 rounded-[10px] font-bold text-white transition-all ${
            combatState.won
              ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400"
              : "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400"
          }`}
        >
          {combatState.won
            ? `Victoire! +${enemy.xpReward || 0} XP`
            : "Combat terminé"}
        </motion.button>
      )}
    </motion.div>
  );
}
