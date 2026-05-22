import { getCombatAbilitiesByClass, ALL_ABILITIES } from './abilities';
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
  const baseDmg = stats.force + Math.floor(stats.agility / 2) + Math.floor(stats.endurance * 0.2);
  const bonusForce = status.buff_force > 0 ? Math.floor(stats.force * BUFF_FORCE_BONUS) : 0;
  const finalDmg = baseDmg + bonusForce;
  
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
  
  let damage = 0;
  let heal = 0;
  let newStatus = { ...currentStatus };
  const newEnemyStatus: StatusEffect[] = [];
  let log = "";
  const manaUsed = ability.manaCost;
  
  switch (abilityId) {
    case "coup_violent":
      damage = Math.floor(stats.force * 1.5);
      log = `Coup Violent! ${damage} dégâts!`;
      break;
      
    case "parade":
      newStatus.buff_defense += 2;
      log = "Parade! Réduction des dégâts pour 2 tours.";
      break;
      
    case "cri_guerre":
      newStatus.buff_force += 3;
      log = "Cri de Guerre! Force augmentée pour 3 tours!";
      break;
      
    case "boule_feu":
      damage = Math.floor(stats.magie * 2);
      log = `Boule de Feu! ${damage} dégâts magiques!`;
      break;
      
    case "bouclier_magique":
      newStatus.buff_defense += 2;
      log = "Bouclier Magique! Protégé pendant 2 tours.";
      break;
      
    case "glace":
      enemy.agility = Math.max(1, enemy.agility - 5);
      log = "Champ de Glace! L'ennemi est ralenti!";
      break;
      
    case "attaque_sournoise":
      const sneakBonus = currentStatus.buff_agility > 0 ? 1.5 : 1;
      damage = Math.floor(stats.agility * sneakBonus * 1.2);
      log = `Attaque Sournoise! ${damage} dégâts!`;
      break;
      
    case "empoisonnement":
      newEnemyStatus.push("poison");
      log = "Empoisonnement! L'ennemi est empoisonné.";
      break;
      
    case "cachette":
      newStatus.buff_agility += 2;
      log = "Cachette! Plus difficile à toucher pendant 2 tours.";
      break;
      
    case "drain_vie":
      damage = Math.floor(stats.magie * 1.2);
      heal = Math.floor(damage / 2);
      log = `Drain de Vie! ${damage} dégâts et +${heal} PV!`;
      break;
      
    case "invocation_squelette":
      damage = Math.floor(stats.magie * 0.8);
      heal = Math.floor(stats.magie * 0.5);
      log = `Invocation! Squelette inflige ${damage} dégâts et te soigne de ${heal} PV.`;
      break;
      
    case "malédiction":
      newEnemyStatus.push("stunned");
      log = "Malédiction! L'ennemi est étourdi!";
      break;
      
    case "tir_precis":
      damage = Math.floor(stats.agility * 1.3);
      log = `Tir Précis! ${damage} dégâts!`;
      break;
      
    case "piege":
      newEnemyStatus.push("stunned");
      log = "Piège! L'ennemi est immobilisé ce tour.";
      break;
      
    case "visée":
      newStatus.buff_agility += 2;
      log = "Visée! Chances de critique augmentées!";
      break;
      
    case "frappe_sainte":
      const isUndead = enemy.id === "squelette" || enemy.id === "nécromancien";
      damage = isUndead ? Math.floor(stats.magie * 2.5) : Math.floor(stats.magie * 1.2);
      log = isUndead ? `Frappe Sainte! SUPER EFFICACE! ${damage} dégâts!` : `Frappe Sainte! ${damage} dégâts!`;
      break;
      
    case "bouclier_faith":
      newStatus.buff_defense += 3;
      log = "Bouclier de Foi! Invulnérable ce tour!";
      break;
      
    case "bénédiction":
      heal = Math.floor(stats.magie * 1.5);
      newStatus.buff_defense += 2;
      log = `Bénédiction! +${heal} PV et défense augmentée!`;
      break;
      
    case "rayon_lumière":
      damage = Math.floor(stats.magie * 1.4);
      log = `Rayon de Lumière! ${damage} dégâts!`;
      break;
      
    case "soin":
      heal = Math.floor(stats.magie * 2);
      log = `Soin! +${heal} PV!`;
      break;
      
    case "purification":
      newStatus = { buff_force: 0, buff_agility: 0, buff_defense: 0, regen: 0, thorns: 0 };
      heal = Math.floor(stats.magie * 0.5);
      log = `Purification! Tous les effets annulés et +${heal} PV.`;
      break;
      
    case "griffes_nature":
      damage = Math.floor(stats.force * 1.2 + stats.agility * 0.5);
      log = `Griffes de Nature! ${damage} dégâts!`;
      break;
      
    case "épines":
      newStatus.thorns += 2;
      log = "Épines! L'ennemi se blesse en attaquant.";
      break;
      
    case "guérison":
      heal = Math.floor(stats.magie * 1.5);
      playerMana = Math.min(playerMana + 20, 100);
      log = `Guérison! +${heal} PV et +20 Mana!`;
      break;
      
    case "coup_dague":
      damage = Math.floor(stats.agility * 1.1);
      log = `Coup de Dague! ${damage} dégâts!`;
      break;
      
    case "fumigène":
      return { success: true, log: "Tu utilises le fumigène et fuis le combat!", manaUsed };
      
    case "jet_de_sable":
      newEnemyStatus.push("stunned");
      log = "Jet de Sable! L'ennemi est étourdi!";
      break;
      
    case "frénésie":
      const hit1 = Math.floor(stats.force * 0.8);
      const hit2 = Math.floor(stats.force * 0.8);
      damage = hit1 + hit2;
      log = `Frénésie! Deux coups pour ${damage} dégâts!`;
      break;
      
    case "rugissement":
      newStatus.buff_defense += 2;
      log = "Rugissement! L'ennemi est terrifié!";
      break;
      
    case "furia":
      newStatus.buff_force += 2;
      newStatus.buff_agility += 2;
      log = "Furie du Barbare! Force et Agilité augmentées pour 2 tours!";
      break;
      
    default:
      log = "Compétence non implémentée.";
  }
  
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
  
  const baseDmg = enemy.force + Math.floor(enemy.agility / 2);
  
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