"use client";

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
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-[#0d1526] border border-red-500/50 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col">
        <div className="bg-red-900/30 border-b border-red-500/30 p-4 text-center sticky top-0 z-10">
          <h2 className="text-red-400 font-bold text-lg">COMBAT</h2>
        </div>

        <div className="p-6 space-y-5 flex-1">
          {/* Player vs Enemy HP */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <div className="text-white font-bold mb-2">Vous</div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                  style={{
                    width: `${(combatState.playerPv / combatState.playerPvMax) * 100}%`,
                  }}
                />
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {combatState.playerPv} / {combatState.playerPvMax} PV
              </div>
              {/* Mana bar */}
              <div className="mt-3">
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                    style={{
                      width: `${(combatState.playerMana / combatState.playerManaMax) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-blue-400 text-xs mt-1">
                  {combatState.playerMana} / {combatState.playerManaMax} Mana
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white text-center">VS</div>
            <div className="text-right">
              <div className="text-red-400 font-bold mb-2">
                {combatState.enemy?.name}
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all"
                  style={{
                    width: `${((combatState.enemy?.pv || 0) / (combatState.enemy?.pvMax || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {combatState.enemy?.pv} / {combatState.enemy?.pvMax} PV
              </div>
            </div>
          </div>

          {/* Status effects */}
          {(combatState.status.buff_force > 0 ||
            combatState.status.buff_agility > 0 ||
            combatState.status.buff_defense > 0) && (
            <div className="flex gap-2 text-xs">
              {combatState.status.buff_force > 0 && (
                <span className="text-orange-400">
                  Force +{combatState.status.buff_force}
                </span>
              )}
              {combatState.status.buff_agility > 0 && (
                <span className="text-green-400">
                  Agilité +{combatState.status.buff_agility}
                </span>
              )}
              {combatState.status.buff_defense > 0 && (
                <span className="text-blue-400">
                  Bouclier {combatState.status.buff_defense}tours
                </span>
              )}
            </div>
          )}

          <p className="text-gray-300 text-sm">
            {combatState.enemy?.description}
          </p>

          {/* Combat actions */}
          {combatState.enemy && !combatState.won && !combatState.fled && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onAttack}
                disabled={combatState.turn !== "player"}
                className="py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-bold"
              >
                Attaquer
              </button>
              <button
                onClick={onDefend}
                disabled={combatState.turn !== "player"}
                className="py-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50"
              >
                Défense
              </button>
              <button
                onClick={onFlee}
                disabled={combatState.turn !== "player"}
                className="py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50"
              >
                Fuir
              </button>
            </div>
          )}

          {/* Abilities */}
          {combatState.enemy && !combatState.won && !combatState.fled && (
            <div className="mt-4">
              <div className="text-purple-400 text-sm font-semibold mb-2">
                Compétences
              </div>
              <div className="grid grid-cols-1 gap-2">
                {getAbilitiesForClass(
                  character?.classe || "guerrier",
                ).map((ability) => {
                  const inCooldown =
                    (combatState.cooldowns[ability.id] || 0) > 0;
                  return (
                    <button
                      key={ability.id}
                      onClick={() => onAbility(ability)}
                      disabled={
                        combatState.turn !== "player" ||
                        inCooldown ||
                        combatState.playerMana < ability.manaCost
                      }
                      className={`py-2 px-3 rounded-lg text-left transition-all ${
                        inCooldown
                          ? "bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed"
                          : combatState.playerMana < ability.manaCost
                            ? "bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed"
                            : ability.type === "attack"
                              ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                              : ability.type === "defense"
                                ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                                : "bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                      } disabled:opacity-50`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{ability.name}</span>
                        <span className="text-xs">
                          {ability.manaCost} Mana
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {ability.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Combat log */}
          <div className="bg-[#070b15] rounded-lg p-3 h-32 overflow-y-auto">
            <div className="space-y-1">
              {combatState.log.slice(-5).map((line, i) => (
                <p key={i} className="text-gray-300 text-sm">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* End combat button */}
          {(combatState.won || combatState.fled) && (
            <button
              onClick={onEnd}
              className="w-full py-3 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600"
            >
              {combatState.won
                ? `Victoire! +${combatState.enemy?.xpReward || 0} XP`
                : "Combat terminé"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
