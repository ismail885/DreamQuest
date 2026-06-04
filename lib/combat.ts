import { getCombatAbilitiesByClass, ALL_ABILITIES } from './abilities';
import { ABILITY_HANDLERS } from './combatAbilityHandlers';
import { type Enemy, type StatusEffect, ENEMIES } from '@/data/enemies';

// Ré-exporter pour compatibilité
export type { Enemy, StatusEffect };

export const CRIT_CHANCE_MAX = 0.5;

export const CRIT_BONUS = 0.5;

export const BUFF_FORCE_BONUS = 0.3;

export const DEFENSE_BUFF_REDUCTION = 0.5;

export const PLAYER_SHIELD_ENEMY_REDUCTION = 0.3;

export const MANA_REGEN_PER_TURN = 10;

export const POISON_DAMAGE_RATIO = 0.1;

export const THORNS_DAMAGE_RATIO = 0.2;

export const DEFENSE_DIVISOR = 4;

export const STEALTH_DODGE_BONUS = 1.5;

export interface CombatAbility {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  type: "attack" | "defense" | "special";
  cooldown: number;
}

/** Construire la map combat depuis la source unique */
function buildCombatAbilitiesMap(): Record<string, CombatAbility[]> {
  const classes = [...new Set(ALL_ABILITIES.filter(a => a.combat).map(a => a.class))];
  const map: Record<string, CombatAbility[]> = {};
  for (const cls of classes) {
    const lower = cls.toLowerCase();
    map[lower] = getCombatAbilitiesByClass(cls).map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      manaCost: a.combat!.manaCost,
      type: a.combat!.combatType,
      cooldown: a.combat!.cooldown,
    }));
  }
  return map;
}

export const ABILITIES: Record<string, CombatAbility[]> = buildCombatAbilitiesMap();

export interface CombatState {
  inCombat: boolean;
  enemy: Enemy | null;
  playerPv: number;
  playerPvMax: number;
  playerMana: number;
  playerManaMax: number;
  turn: "player" | "enemy";
  log: string[];
  won: boolean;
  lost: boolean;
  fled: boolean;
  status: PlayerStatus;
  enemyStatus: StatusEffect[];
  cooldowns: Record<string, number>;
}

export interface PlayerStatus {
  buff_force: number;
  buff_agility: number;
  buff_defense: number;
  regen: number;
  thorns: number;
}

export function getRandomEnemy(level: number = 1): Enemy {
  const seuil = Math.max(30, level * 40 + 30);
  const filtered = ENEMIES.filter(e => e.xpReward <= seuil);
  const pool = filtered.length > 0 ? filtered : ENEMIES.slice(0, 1);
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function getEnemyById(id: string): Enemy | undefined {
  return ENEMIES.find(e => e.id === id);
}

export function playerAttack(stats: { force: number; agility: number; magie: number; endurance: number }, enemy: Enemy, status: PlayerStatus): { dmg: number; log: string; isCrit: boolean } {
  const baseDmg = Math.floor(stats.force * 0.8 + stats.agility * 0.3 + stats.endurance * 0.15);
  const bonusForce = status.buff_force > 0 ? Math.floor(stats.force * BUFF_FORCE_BONUS) : 0;
  const enemyDefense = Math.floor((enemy.defense || 0) * 0.5);
  const finalDmg = Math.max(1, baseDmg + bonusForce - enemyDefense);
  
  const critChance = Math.min(CRIT_CHANCE_MAX, stats.agility / 100);
  const isCrit = Math.random() < critChance;
  const dmg = Math.max(1, finalDmg + (isCrit ? Math.floor(finalDmg * CRIT_BONUS) : 0));
  
  return {
    dmg,
    log: isCrit ? `Coup critique! Tu infliges ${dmg} dégâts!` : `Tu frappes pour ${dmg} dégâts.`,
    isCrit,
  };
}

export function executeAbility(
  abilityId: string,
  characterClass: string,
  stats: { force: number; agility: number; magie: number; endurance: number },
  enemy: Enemy,
  currentStatus: PlayerStatus,
  playerPv: number,
  playerMana: number,
  currentCooldowns: Record<string, number> = {}
): { success: boolean; damage?: number; heal?: number; newStatus?: PlayerStatus; newEnemyStatus?: StatusEffect[]; log: string; manaUsed: number; newCooldowns?: Record<string, number> } {
  const abilities = ABILITIES[characterClass.toLowerCase()] || ABILITIES["guerrier"];
  const ability = abilities.find(a => a.id === abilityId);
  
  if (!ability) {
    return { success: false, log: "Compétence inconnue", manaUsed: 0 };
  }
  
  if (playerMana < ability.manaCost) {
    return { success: false, log: "Pas assez de mana", manaUsed: 0 };
  }
  
  // Vérifier le cooldown
  if (ability.cooldown > 0 && (currentCooldowns[abilityId] || 0) > 0) {
    return { success: false, log: `${ability.name} est en recharge (${currentCooldowns[abilityId]} tours restants)`, manaUsed: 0 };
  }
  
  const manaUsed = ability.manaCost;

  // Chercher le handler dans le registry
  const handler = ABILITY_HANDLERS[abilityId];

  if (!handler) {
    return { success: false, log: "Compétence non implémentée.", manaUsed: 0 };
  }

  const result = handler({ stats, enemy, currentStatus, playerPv, playerMana });

  // Appliquer les modifications à l'ennemi (ex: glace réduit l'agilité)
  if (result.enemyModifications) {
    Object.assign(enemy, result.enemyModifications);
  }

  // Gérer les flags spéciaux (ex: fuite)
  if (result.specialFlag === 'fled') {
    return { success: true, log: result.log, manaUsed };
  }

  const damage = result.damage ?? 0;
  const heal = result.heal ?? 0;
  const log = result.log;
  const newStatus = result.newStatus ?? { ...currentStatus };
  const newEnemyStatus = result.newEnemyStatus ?? [];
  
  // Appliquer le cooldown si la compétence en a un
  const newCooldowns = ability.cooldown > 0
    ? { ...currentCooldowns, [abilityId]: ability.cooldown }
    : currentCooldowns;

  return { success: true, damage, heal, newStatus, newEnemyStatus, log, manaUsed, newCooldowns };
}

export function updateCooldowns(cooldowns: Record<string, number>): Record<string, number> {
  const updated: Record<string, number> = {};
  for (const [id, turns] of Object.entries(cooldowns)) {
    if (turns > 1) {
      updated[id] = turns - 1;
    }
    // Si turns === 1, on laisse tomber la clé (cooldown fini)
  }
  return updated;
}

export function playerDefense(stats: { agility: number; endurance: number }, status: PlayerStatus): { reduction: number; log: string } {
  const baseReduction = Math.floor((stats.agility + stats.endurance) / DEFENSE_DIVISOR);
  const bonusDef = status.buff_defense > 0 ? Math.floor(baseReduction * DEFENSE_BUFF_REDUCTION) : 0;
  const reduction = baseReduction + bonusDef;
  
  return {
    reduction,
    log: status.buff_defense > 0 
      ? `Parade parfaite! -${reduction} dégâts (bouclier actif).` 
      : `Tu pare! -${reduction} dégâts.`,
  };
}

export function enemyAttack(enemy: Enemy, playerStatus: PlayerStatus, playerAgility: number = 0): { dmg: number; log: string; dodged: boolean } {
  // Chance d'esquive basée sur l'agilité
  let dodgeChance = Math.min(0.5, playerAgility / 100);
  if (playerStatus.buff_agility > 0) {
    dodgeChance = Math.min(0.75, dodgeChance * STEALTH_DODGE_BONUS);
  }
  
  const hasThorns = playerStatus.thorns > 0;
  if (Math.random() < dodgeChance) {
    // thorns damage back even on dodge (épines réactives)
    const thornsDmg = hasThorns ? Math.floor(enemy.force * THORNS_DAMAGE_RATIO) : 0;
    let log = `${enemy.name} t'attaque mais tu esquives!`;
    if (hasThorns) {
      log += ` L'ennemi subit ${thornsDmg} dégâts d'épines!`;
    }
    return { dmg: 0, log, dodged: true };
  }
  
  const baseDmg = Math.floor(enemy.force * 1.2 + enemy.agility * 0.5);
  
  // Apply debuff from player status
  let reduction = 0;
  if (playerStatus.buff_defense > 0) {
    reduction = Math.floor(baseDmg * PLAYER_SHIELD_ENEMY_REDUCTION);
  }
  
  const dmg = Math.max(1, baseDmg - reduction);
  
  // thorns damage back
  const thornsDmg = hasThorns ? Math.floor(dmg * THORNS_DAMAGE_RATIO) : 0;
  
  let log = `${enemy.name} attaque pour ${dmg} dégâts!`;
  if (playerStatus.buff_defense > 0) {
    log += ` (Réduit par bouclier)`;
  }
  if (hasThorns) {
    log += ` L'ennemi subit ${thornsDmg} dégâts d'épines!`;
  }
  
  return { dmg, log, dodged: false };
}

export function applyPoisonDamage(enemy: Enemy): { dmg: number; log: string } {
  const dmg = Math.floor(enemy.pvMax * POISON_DAMAGE_RATIO);
  return { dmg, log: `Le poison fait ${dmg} dégâts!` };
}

export function updateCombatStatus(currentStatus: PlayerStatus): PlayerStatus {
  return {
    buff_force: Math.max(0, currentStatus.buff_force - 1),
    buff_agility: Math.max(0, currentStatus.buff_agility - 1),
    buff_defense: Math.max(0, currentStatus.buff_defense - 1),
    regen: Math.max(0, currentStatus.regen - 1),
    thorns: Math.max(0, currentStatus.thorns - 1),
  };
}

export function updateEnemyStatus(statuses: StatusEffect[]): StatusEffect[] {
  // "stunned" dure 1 tour, "poison" est permanent jusqu'à la fin du combat
  return statuses.filter(s => s !== "stunned" && s !== "buff_agility");
}

export function regenerateMana(currentMana: number, maxMana: number): number {
  return Math.min(maxMana, currentMana + MANA_REGEN_PER_TURN);
}

export function createCombatState(initialPlayerPv: number, initialMana: number = 50, level: number = 1): CombatState {
  const enemy = getRandomEnemy(level);
  return {
    inCombat: true,
    enemy: { ...enemy },
    playerPv: initialPlayerPv,
    playerPvMax: initialPlayerPv,
    playerMana: initialMana,
    playerManaMax: initialMana,
    turn: "player",
    log: [`Un ${enemy.name} apparaît!${enemy.description ? " (" + enemy.description + ")" : ""}`],
    won: false,
    lost: false,
    fled: false,
    status: { buff_force: 0, buff_agility: 0, buff_defense: 0, regen: 0, thorns: 0 },
    enemyStatus: [],
    cooldowns: {},
  };
}

export function getAbilitiesForClass(characterClass: string): CombatAbility[] {
  return ABILITIES[characterClass.toLowerCase()] || ABILITIES["guerrier"];
}