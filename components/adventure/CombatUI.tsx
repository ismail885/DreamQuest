"use client";

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Trophy, Zap, Crosshair, ShieldHalf, Gem } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAbilitiesForClass, type CombatState, type CombatAbility } from "@/lib/combat";
import type { Character } from "@/types";

function logColor(line: string): string {
  if (/critique/i.test(line)) return "text-yellow-400";
  if (/esquive/i.test(line)) return "text-green-400";
  if (/étourdi|stun/i.test(line)) return "text-yellow-400";
  if (/poison|épines/i.test(line)) return "text-purple-400";
  if (/pare|bouclier|défense|réduit/i.test(line)) return "text-blue-400";
  if (/soin|régénère/i.test(line)) return "text-emerald-400";
  if (/dégâts|inflige|frappes?|attaque/i.test(line)) return "text-red-400";
  if (/XP/i.test(line)) return "text-orange-400";
  if (/apparaît/i.test(line)) return "text-cyan-300";
  if (/fui|Fuite/i.test(line)) return "text-yellow-400";
  if (/vaincu|perdu/i.test(line)) return "text-red-500 font-semibold";
  return "text-gray-400";
}

interface FloatingDmg {
  id: number;
  value: number;
  type: "damage" | "heal" | "crit";
  side: "player" | "enemy";
}

function FloatingDamage({ dmg, onComplete }: { dmg: FloatingDmg; onComplete: (id: number) => void }) {
  const colorMap: Record<string, string> = {
    damage: "text-red-400",
    heal: "text-emerald-400",
    crit: "text-yellow-300",
  };
  const sizeMap: Record<string, string> = {
    damage: "text-lg",
    heal: "text-lg",
    crit: "text-2xl",
  };
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: dmg.type === "crit" ? 1.5 : 1 }}
      animate={{ opacity: 0, y: -60, scale: dmg.type === "crit" ? 1.8 : 1.2 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      onAnimationComplete={() => onComplete(dmg.id)}
      className={`absolute ${colorMap[dmg.type]} ${sizeMap[dmg.type]} font-black pointer-events-none top-0 left-1/2 -translate-x-1/2`}
      style={{ zIndex: 50, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
    >
      {dmg.type === "heal" ? `+${dmg.value}` : `-${dmg.value}`}
    </motion.div>
  );
}

interface CombatUIProps {
  combatState: CombatState;
  character: Character;
  onAttack: () => void;
  onDefend: () => void;
  onFlee: () => void;
  onAbility: (ability: CombatAbility) => void;
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
  const playerPvRatio = combatState.playerPv / combatState.playerPvMax;
  const enemyPvRatio = enemy ? enemy.pv / enemy.pvMax : 0;
  const playerManaRatio = combatState.playerMana / combatState.playerManaMax;
  const logEndRef = useRef<HTMLDivElement>(null);
  const [floatingDmgs, setFloatingDmgs] = useState<FloatingDmg[]>([]);
  const [shakeEnemy, setShakeEnemy] = useState(0);
  const [shakePlayer, setShakePlayer] = useState(0);
  const [critFlash, setCritFlash] = useState(false);
  const [abilityPulse, setAbilityPulse] = useState(0);
  const prevLogLengthRef = useRef(combatState.log.length);
  const nextDmgIdRef = useRef(0);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combatState.log.length]);

  useEffect(() => {
    const prevLen = prevLogLengthRef.current;
    if (combatState.log.length > prevLen) {
      const newEntries = combatState.log.slice(prevLen);
      for (const line of newEntries) {
        const dmgMatch = line.match(/(\d+)\s*dégâts?/i);
        if (dmgMatch) {
          const value = parseInt(dmgMatch[1]);
          const isCrit = /critique/i.test(line);
          const isDmgToEnemy = /Tu infliges|Tu frappes|L'ennemi subit|Le poison fait/i.test(line);

          if (isDmgToEnemy) {
            const id = nextDmgIdRef.current++;
            setFloatingDmgs(prev => [...prev, { id, value, type: isCrit ? "crit" : "damage", side: "enemy" }]);
            setShakeEnemy(prev => prev + 1);
            if (isCrit) {
              setCritFlash(true);
              setTimeout(() => setCritFlash(false), 600);
            }
          } else if (/attaque pour/i.test(line) && !/Tu/i.test(line)) {
            const id = nextDmgIdRef.current++;
            setFloatingDmgs(prev => [...prev, { id, value, type: "damage", side: "player" }]);
            setShakePlayer(prev => prev + 1);
          }
        }

        const healMatch = line.match(/récupères?\s*(\d+)/i);
        if (healMatch) {
          const id = nextDmgIdRef.current++;
          setFloatingDmgs(prev => [...prev, { id, value: parseInt(healMatch[1]), type: "heal", side: "player" }]);
        }
      }
    }
    prevLogLengthRef.current = combatState.log.length;
  }, [combatState.log, combatState.log.length]);

  const removeFloatingDmg = useCallback((id: number) => {
    setFloatingDmgs(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleAbility = useCallback((ability: CombatAbility) => {
    setAbilityPulse(prev => prev + 1);
    onAbility(ability);
  }, [onAbility]);

  const { t } = useLanguage();
  if (!enemy) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-card bg-slate-900/70 border border-red-500/30 rounded-card p-6 sm:p-8 space-y-6 shadow-2xl shadow-red-900/20"
    >
      <div className="flex items-center gap-3 mb-1">
        <Swords className="w-6 h-6 text-red-400" aria-hidden="true" />
        <h2 className="text-red-400 font-bold text-xl sm:text-2xl tracking-wide">{t("adventure.combat.title")}</h2>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-5 items-center">
        <div className="relative rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-slate-900/40 p-3 sm:p-4">
          <motion.div
            animate={shakePlayer > 0 ? { x: [0, -5, 5, -3, 3, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold flex-shrink-0">
                {(character.nom_personnage || "T").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{character.nom_personnage || "Toi"}</p>
                <div className="flex flex-wrap gap-x-2 text-[10px] leading-tight">
                  {combatState.status.buff_force > 0 && <span className="text-orange-400">Force+{combatState.status.buff_force}</span>}
                  {combatState.status.buff_agility > 0 && <span className="text-green-400">Agilité+{combatState.status.buff_agility}</span>}
                  {combatState.status.buff_defense > 0 && <span className="text-blue-400">Bouclier</span>}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{t("adventure.combat.health")}</span>
                <span className="text-gray-200 font-medium">{combatState.playerPv} / {combatState.playerPvMax}</span>
              </div>
              <div className="h-3 bg-gray-800/80 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                  animate={{ width: `${playerPvRatio * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-300">{t("adventure.combat.mana")}</span>
                <span className="text-blue-200 font-medium">{combatState.playerMana} / {combatState.playerManaMax}</span>
              </div>
              <div className="h-2 bg-gray-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                  style={{ width: `${playerManaRatio * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
          <AnimatePresence>
            {floatingDmgs.filter(d => d.side === "player").map(d => (
              <FloatingDamage key={d.id} dmg={d} onComplete={removeFloatingDmg} />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center justify-center px-0.5">
          <Swords className="w-7 h-7 sm:w-9 sm:h-9 text-gray-400" aria-hidden="true" />
          <div className="text-lg sm:text-2xl font-black text-gray-500 mt-1">{t("adventure.combat.vs")}</div>
        </div>

        <div className="relative rounded-xl border border-red-500/30 bg-gradient-to-b from-red-500/10 to-slate-900/40 p-3 sm:p-4">
          {critFlash && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-yellow-400/30 rounded-xl pointer-events-none"
              style={{ zIndex: 40 }}
            />
          )}
          <motion.div
            animate={shakeEnemy > 0 ? { x: [0, -5, 5, -3, 3, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-300 flex-shrink-0">
                <Swords className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-red-300 font-semibold text-sm truncate">{enemy.name}</p>
                <div className="flex items-center gap-2 text-[10px] leading-tight">
                  {enemy.level && <span className="text-gray-400">{t("adventure.combat.level")}{enemy.level}</span>}
                  {enemy.xpReward > 0 && (
                    <span className="text-orange-400/70 flex items-center gap-0.5">
                      <Gem className="w-2.5 h-2.5" />{enemy.xpReward}XP
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{t("adventure.combat.health")}</span>
                <span className="text-gray-200 font-medium">{enemy.pv} / {enemy.pvMax}</span>
              </div>
              <div className="h-3 bg-gray-800/80 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                  animate={{ width: `${enemyPvRatio * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-red-400/80">
                <Crosshair className="w-3 h-3" />{enemy.force}
              </span>
              <span className="flex items-center gap-1 text-blue-400/80">
                <ShieldHalf className="w-3 h-3" />{enemy.defense}
              </span>
            </div>
          </motion.div>
          <AnimatePresence>
            {floatingDmgs.filter(d => d.side === "enemy").map(d => (
              <FloatingDamage key={d.id} dmg={d} onComplete={removeFloatingDmg} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {enemy.description && (
        <p className="text-gray-500 text-xs italic text-center">{enemy.description}</p>
      )}

      {!combatState.won && !combatState.lost && !combatState.fled && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAttack}
              disabled={combatState.turn !== "player"}
              aria-label={t("adventure.combat.attack")}
              className="flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-card hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all"
            >
              <Swords className="w-4 h-4" aria-hidden="true" />
              {t("adventure.combat.attack")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDefend}
              disabled={combatState.turn !== "player"}
              aria-label={t("adventure.combat.defend")}
              className="flex items-center justify-center gap-2 py-3 bg-blue-500/10 border border-blue-500/40 text-blue-400 rounded-card hover:bg-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              {t("adventure.combat.defend")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onFlee}
              disabled={combatState.turn !== "player"}
              aria-label={t("adventure.combat.flee")}
              className="flex items-center justify-center gap-2 py-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-card hover:bg-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all"
            >
              <Trophy className="w-4 h-4" aria-hidden="true" />
              {t("adventure.combat.flee")}
            </motion.button>
          </div>

          <div>
            <motion.div
              animate={abilityPulse > 0 ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-2"
            >
              <Zap className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span className="text-purple-400 text-sm font-semibold">{t("adventure.combat.skills")}</span>
            </motion.div>
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
                    onClick={() => handleAbility(ability)}
                    disabled={disabled}
                    title={ability.description}
                    aria-label={`${ability.name} : ${ability.description}`}
                    className={`text-left px-3 py-2.5 rounded-card border text-sm transition-all ${
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
                      <span className="text-xs text-gray-500">{ability.manaCost} {t("adventure.combat.mana")}</span>
                    </div>
                    {inCooldown && (
                      <span className="text-xs text-gray-600">{t("adventure.combat.cooldown")}: {combatState.cooldowns[ability.id]} {t("adventure.combat.turns")}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="bg-deep/80 border border-gray-800/60 rounded-card overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-800/60 text-gray-400 text-xs font-semibold uppercase tracking-wide">
          {t("adventure.combat.log")}
        </div>
        <div className="p-4 h-28 sm:h-32 overflow-y-auto space-y-1 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700">
          {combatState.log.slice(-10).map((line, i) => (
            <p key={i} className={`${logColor(line)} text-sm leading-relaxed`}>{line}</p>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

        {(combatState.won || combatState.lost || combatState.fled) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnd}
          aria-label={combatState.won ? t("adventure.combat.victory") : combatState.fled ? t("adventure.combat.escaped") : t("adventure.combat.defeat")}
          className={`w-full py-3 rounded-card font-bold text-white transition-all ${
            combatState.won
              ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400"
              : "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400"
          }`}
        >
          {combatState.won ? (
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" aria-hidden="true" />
              <span>{t("adventure.combat.victory")}</span>
              <span className="text-yellow-200">+{enemy.xpReward || 0} XP</span>
              {character.niveau && (
                <span className="text-xs text-white/60">({t("adventure.combat.level")}{character.niveau})</span>
              )}
            </div>
          ) : combatState.fled
            ? t("adventure.combat.escaped")
            : t("adventure.combat.defeat")}
        </motion.button>
      )}
    </motion.div>
  );
}


