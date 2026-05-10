export interface Enemy {
  id: string;
  name: string;
  description: string;
  pv: number;
  pvMax: number;
  force: number;
  agility: number;
  intelligence: number;
  xpReward: number;
  loot?: string;
  status?: StatusEffect[];
}

export type StatusEffect = "poison" | "stunned" | "buff_force" | "buff_agility" | "buff_defense" | "regen";

export interface CombatAbility {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  type: "attack" | "defense" | "special";
  cooldown: number;
}

export const ABILITIES: Record<string, CombatAbility[]> = {
  guerrier: [
    { id: "coup_violent", name: "Coup Violent", description: "Attaque puissante qui ignore partiellement la défense", manaCost: 15, type: "attack", cooldown: 0 },
    { id: "parade", name: "Parade", description: "Réduit les dommages du prochain attack", manaCost: 10, type: "defense", cooldown: 0 },
    { id: "cri_guerre", name: "Cri de Guerre", description: "Augmente votre force pour 3 tours", manaCost: 20, type: "special", cooldown: 3 },
  ],
  mage: [
    { id: "boule_feu", name: "Boule de Feu", description: "Attaque magique puissante", manaCost: 20, type: "attack", cooldown: 0 },
    { id: "bouclier_magique", name: "Bouclier Magique", description: "Barrière protectrice pendant 2 tours", manaCost: 15, type: "defense", cooldown: 2 },
    { id: "glace", name: "Champ de Glace", description: "Ralentit l'ennemi et réduit son agilité", manaCost: 25, type: "special", cooldown: 3 },
  ],
  assassin: [
    { id: "attaque_sournoise", name: "Attaque Sournoise", description: "Coup critique garanti si caché", manaCost: 15, type: "attack", cooldown: 0 },
    { id: "empoisonnement", name: "Empoisonnement", description: "Empoisonne l'ennemi pour 3 tours", manaCost: 20, type: "special", cooldown: 2 },
    { id: "cachette", name: "Cachette", description: "Deviens difficile à toucher pendant 2 tours", manaCost: 10, type: "defense", cooldown: 2 },
  ],
  nécromancien: [
    { id: "drain_vie", name: "Drain de Vie", description: "Vole des PV à l'ennemi", manaCost: 15, type: "attack", cooldown: 0 },
    { id: "invocation_squelette", name: "Invocation", description: "Invoque un squelette帮忙", manaCost: 30, type: "special", cooldown: 4 },
    { id: "malédiction", name: "Malédiction", description: "Réduit les stats de l'ennemi", manaCost: 25, type: "special", cooldown: 3 },
  ],
  archer: [
    { id: "tir_precis", name: "Tir Précis", description: "Attaque à distance précise", manaCost: 10, type: "attack", cooldown: 0 },
    { id: "piege", name: "Piège", description: "Immobilise l'ennemi pendant 1 tour", manaCost: 15, type: "special", cooldown: 2 },
    { id: "visée", name: "Visée", description: "Augmente les chances de critique", manaCost: 20, type: "special", cooldown: 3 },
  ],
  paladin: [
    { id: "frappe_sainte", name: "Frappe Sainte", description: "Attaque sacrée contre les morts-vivants", manaCost: 20, type: "attack", cooldown: 0 },
    { id: "bouclier_faith", name: "Bouclier de Foi", description: "Invulnérable pendant 1 tour", manaCost: 25, type: "defense", cooldown: 3 },
    { id: "bénédiction", name: "Bénédiction", description: "Restaure des PV et augmente la défense", manaCost: 20, type: "special", cooldown: 2 },
  ],
  prêtre: [
    { id: "rayon_lumière", name: "Rayon de Lumière", description: "Attaque sacrée", manaCost: 15, type: "attack", cooldown: 0 },
    { id: "soin", name: "Soin", description: "Restaure des PV", manaCost: 20, type: "special", cooldown: 0 },
    { id: "purification", name: "Purification", description: "Soigne tous les effets de statut", manaCost: 15, type: "special", cooldown: 2 },
  ],
  druide: [
    { id: "griffes_nature", name: "Griffes de Nature", description: "Attaque naturelle", manaCost: 10, type: "attack", cooldown: 0 },
    { id: "épines", name: "Épines", description: "L'ennemi prend des dégats en attackant", manaCost: 15, type: "defense", cooldown: 2 },
    { id: "guérison", name: "Guérison", description: "Restaure des PV et du mana", manaCost: 25, type: "special", cooldown: 3 },
  ],
  voleur: [
    { id: "coup_dague", name: "Coup de Dague", description: "Attaque rapide", manaCost: 10, type: "attack", cooldown: 0 },
    { id: "fumigène", name: "Fumigène", description: "Fuite garantie", manaCost: 5, type: "special", cooldown: 3 },
    { id: "jet_de_sable", name: "Jet de Sable", description: "Étourdit l'ennemi", manaCost: 15, type: "special", cooldown: 2 },
  ],
  barbare: [
    { id: "frénésie", name: "Frénésie", description: "Attaque double pour ce tour", manaCost: 20, type: "attack", cooldown: 0 },
    { id: "rugissement", name: "Rugissement", description: "Terrifie l'ennemi, annule son prochain attack", manaCost: 15, type: "defense", cooldown: 2 },
    { id: "furia", name: "Furie du Barbare", description: "Multiples attacks pendant 2 tours", manaCost: 30, type: "special", cooldown: 4 },
  ],
};

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
}

const ENEMIES: Enemy[] = [
  { id: "gobelin", name: "Gobelin", description: "Une petite créature verdâtre", pv: 30, pvMax: 30, force: 8, agility: 10, intelligence: 4, xpReward: 20, loot: "couteau" },
  { id: "loup", name: "Loup", description: "Un loup affamé", pv: 40, pvMax: 40, force: 12, agility: 14, intelligence: 6, xpReward: 30, loot: "fourrure" },
  { id: "orc", name: "Orc", description: "Un guerrier orc", pv: 60, pvMax: 60, force: 18, agility: 8, intelligence: 8, xpReward: 50, loot: "hache" },
  { id: "squelette", name: "Squelette", description: "Un mort-vivant", pv: 35, pvMax: 35, force: 10, agility: 12, intelligence: 2, xpReward: 25, loot: "os" },
  { id: "sorciere", name: "Sorcière", description: "Une magicienne sombre", pv: 25, pvMax: 25, force: 6, agility: 10, intelligence: 20, xpReward: 40, loot: "potion" },
  { id: "troll", name: "Troll", description: "Un troll des montagnes", pv: 80, pvMax: 80, force: 22, agility: 4, intelligence: 4, xpReward: 70, loot: "peau" },
  { id: "dragon", name: "Jeune Dragon", description: "Un dragon affamé", pv: 100, pvMax: 100, force: 25, agility: 12, intelligence: 14, xpReward: 100, loot: "ecaille" },
];

export function getRandomEnemy(level: number = 1): Enemy {
  const filtered = ENEMIES.filter(e => e.xpReward <= level * 40 + 30);
  const pool = filtered.length > 0 ? filtered : ENEMIES;
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function getEnemyById(id: string): Enemy | undefined {
  return ENEMIES.find(e => e.id === id);
}

export function initCombat(playerPvMax: number, playerManaMax: number = 50, level: number = 1): CombatState {
  const enemy = getRandomEnemy(level);
  return {
    inCombat: false,
    enemy,
    playerPv: playerPvMax,
    playerPvMax: playerPvMax,
    playerMana: playerManaMax,
    playerManaMax: playerManaMax,
    turn: "player",
    log: [`Un ${enemy.name} apparait!`],
    won: false,
    fled: false,
    status: { buff_force: 0, buff_agility: 0, buff_defense: 0, regen: 0 },
    enemyStatus: [],
    cooldowns: {},
  };
}

export function playerAttack(stats: { force: number; agility: number; magie: number }, enemy: Enemy, status: PlayerStatus): { dmg: number; log: string; isCrit: boolean } {
  const baseDmg = stats.force + Math.floor(stats.agility / 2);
  const bonusForce = status.buff_force > 0 ? Math.floor(stats.force * 0.3) : 0;
  const finalDmg = baseDmg + bonusForce;
  
  const critChance = Math.min(0.5, stats.agility / 100);
  const isCrit = Math.random() < critChance;
  const dmg = Math.max(1, finalDmg + (isCrit ? Math.floor(finalDmg * 0.5) : 0));
  
  return {
    dmg,
    log: isCrit ? `Coup critique! Tu infliges ${dmg} dégats!` : `Tu frappes pour ${dmg} dégats.`,
    isCrit,
  };
}

export function useAbility(
  abilityId: string,
  characterClass: string,
  stats: { force: number; agility: number; magie: number; endurance: number },
  enemy: Enemy,
  currentStatus: PlayerStatus,
  playerPv: number,
  playerMana: number
): { success: boolean; damage?: number; heal?: number; newStatus?: PlayerStatus; newEnemyStatus?: StatusEffect[]; log: string; manaUsed: number } {
  const abilities = ABILITIES[characterClass.toLowerCase()] || ABILITIES["guerrier"];
  const ability = abilities.find(a => a.id === abilityId);
  
  if (!ability) {
    return { success: false, log: "Compétence inconnue", manaUsed: 0 };
  }
  
  if (playerMana < ability.manaCost) {
    return { success: false, log: "Pas assez de mana", manaUsed: 0 };
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
      log = `Coup Violent! ${damage} dégats!`;
      break;
      
    case "parade":
      newStatus.buff_defense = 2;
      log = "Parade! Réduction des dégats pour 2 tours.";
      break;
      
    case "cri_guerre":
      newStatus.buff_force = 3;
      log = "Cri de Guerre! Force augmentée pour 3 tours!";
      break;
      
    case "boule_feu":
      damage = Math.floor(stats.magie * 2);
      log = `Boule de Feu! ${damage} dégats magiques!`;
      break;
      
    case "bouclier_magique":
      newStatus.buff_defense = 2;
      log = "Bouclier Magique! Protégé pendant 2 tours.";
      break;
      
    case "glace":
      newEnemyStatus.push("buff_agility");
      enemy.agility = Math.max(1, enemy.agility - 5);
      log = "Champ de Glace! L'ennemi est ralenti!";
      break;
      
    case "attaque_sournoise":
      const sneakBonus = currentStatus.buff_agility > 0 ? 1.5 : 1;
      damage = Math.floor(stats.agility * sneakBonus * 1.2);
      log = `Attaque Sournoise! ${damage} dégats!`;
      break;
      
    case "empoisonnement":
      newEnemyStatus.push("poison");
      log = "Empoisonnement! L'ennemi est empoisonné.";
      break;
      
    case "cachette":
      newStatus.buff_agility = 2;
      log = "Cachette! Plus difficile à toucher pendant 2 tours.";
      break;
      
    case "drain_vie":
      damage = Math.floor(stats.magie * 1.2);
      heal = Math.floor(damage / 2);
      log = `Drain de Vie! ${damage} dégats et +${heal} PV!`;
      break;
      
    case "invocation_squelette":
      damage = Math.floor(stats.magie * 0.8);
      heal = Math.floor(stats.magie * 0.5);
      log = `Invocation! Squelette inflige ${damage} dégats et te soigne de ${heal} PV.`;
      break;
      
    case "malédiction":
      newEnemyStatus.push("stunned");
      log = "Malédiction! L'ennemi est étourdi!";
      break;
      
    case "tir_precis":
      damage = Math.floor(stats.agility * 1.3);
      log = `Tir Précis! ${damage} dégats!`;
      break;
      
    case "piege":
      newEnemyStatus.push("stunned");
      log = "Piège! L'ennemi est immobilisé ce tour.";
      break;
      
    case "visée":
      newStatus.buff_agility = 2;
      log = "Visée! Chances de critique augmentées!";
      break;
      
    case "frappe_sainte":
      const isUndead = enemy.id === "squelette" || enemy.id === "nécromancien";
      damage = isUndead ? Math.floor(stats.magie * 2.5) : Math.floor(stats.magie * 1.2);
      log = isUndead ? `Frappe Sainte! SUPER EFFICACE! ${damage} dégats!` : `Frappe Sainte! ${damage} dégats!`;
      break;
      
    case "bouclier_faith":
      newStatus.buff_defense = 3;
      log = "Bouclier de Foi! Invulnérable ce tour!";
      break;
      
    case "bénédiction":
      heal = Math.floor(stats.magie * 1.5);
      newStatus.buff_defense = 2;
      log = `Bénédiction! +${heal} PV et défense augmentée!`;
      break;
      
    case "rayon_lumière":
      damage = Math.floor(stats.magie * 1.4);
      log = `Rayon de Lumière! ${damage} dégats!`;
      break;
      
    case "soin":
      heal = Math.floor(stats.magie * 2);
      log = `Soin! +${heal} PV!`;
      break;
      
    case "purification":
      newStatus = { buff_force: 0, buff_agility: 0, buff_defense: 0, regen: 0 };
      heal = Math.floor(stats.magie * 0.5);
      log = `Purification! Tous les effets annulés et +${heal} PV.`;
      break;
      
    case "griffes_nature":
      damage = Math.floor(stats.force * 1.2 + stats.agility * 0.5);
      log = `Griffes de Nature! ${damage} dégats!`;
      break;
      
    case "épines":
      newStatus.buff_defense = 2;
      log = "Épines! L'ennemi se blesse en attackant.";
      break;
      
    case "guérison":
      heal = Math.floor(stats.magie * 1.5);
      playerMana = Math.min(playerMana + 20, 100);
      log = `Guérison! +${heal} PV et +20 Mana!`;
      break;
      
    case "coup_dague":
      damage = Math.floor(stats.agility * 1.1);
      log = `Coup de Dague! ${damage} dégats!`;
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
      log = `Frénésie! Deux coups pour ${damage} dégats!`;
      break;
      
    case "rugissement":
      newStatus.buff_defense = 2;
      log = "Rugissement! L'ennemi est terrifié!";
      break;
      
    case "furia":
      newStatus.buff_force = 2;
      newStatus.buff_agility = 2;
      log = "Furie du Barbare! Force et Agilité doublées pour 2 tours!";
      break;
      
    default:
      log = "Compétence non implémentée.";
  }
  
  return { success: true, damage, heal, newStatus, newEnemyStatus, log, manaUsed };
}

export function playerDefense(stats: { agility: number; endurance: number }, status: PlayerStatus): { reduction: number; log: string } {
  const baseReduction = Math.floor((stats.agility + stats.endurance) / 4);
  const bonusDef = status.buff_defense > 0 ? Math.floor(baseReduction * 0.5) : 0;
  const reduction = baseReduction + bonusDef;
  
  return {
    reduction,
    log: status.buff_defense > 0 
      ? `Parade parfaite! -${reduction} dégats (bouclier actif).` 
      : `Tu pare! -${reduction} dégats.`,
  };
}

export function enemyAttack(enemy: Enemy, playerStatus: PlayerStatus, hasThorns: boolean): { dmg: number; log: string } {
  const baseDmg = enemy.force + Math.floor(enemy.agility / 2);
  
  // Apply debuff from player status
  let reduction = 0;
  if (playerStatus.buff_defense > 0) {
    reduction = Math.floor(baseDmg * 0.3);
  }
  
  const dmg = Math.max(1, baseDmg - reduction);
  
  // thorns damage back
  const thornsDmg = hasThorns ? Math.floor(dmg * 0.2) : 0;
  
  let log = `${enemy.name} attaque pour ${dmg} dégats!`;
  if (playerStatus.buff_defense > 0) {
    log += ` (Réduit par bouclier)`;
  }
  if (hasThorns) {
    log += ` L'ennemi subit ${thornsDmg} dégats d'épines!`;
  }
  
  return { dmg, log: log };
}

export function applyPoisonDamage(enemy: Enemy): { dmg: number; log: string } {
  const dmg = Math.floor(enemy.pvMax * 0.1);
  return { dmg, log: `Le poison fait ${dmg} dégats!` };
}

export function updateCombatStatus(currentStatus: PlayerStatus): PlayerStatus {
  return {
    buff_force: Math.max(0, currentStatus.buff_force - 1),
    buff_agility: Math.max(0, currentStatus.buff_agility - 1),
    buff_defense: Math.max(0, currentStatus.buff_defense - 1),
    regen: Math.max(0, currentStatus.regen - 1),
  };
}

export function updateEnemyStatus(statuses: StatusEffect[]): StatusEffect[] {
  return statuses.filter(s => s !== "stunned" && s !== "poison" && s !== "buff_agility");
}

export function regenerateMana(currentMana: number, maxMana: number): number {
  return Math.min(maxMana, currentMana + 10);
}

export function useCombatState(initialPlayerPv: number, initialMana: number = 50, level: number = 1): CombatState {
  const enemy = getRandomEnemy(level);
  return {
    inCombat: true,
    enemy: { ...enemy },
    playerPv: initialPlayerPv,
    playerPvMax: initialPlayerPv,
    playerMana: initialMana,
    playerManaMax: initialMana,
    turn: "player",
    log: [`Un ${enemy.name} apparait!${enemy.description ? " (" + enemy.description + ")" : ""}`],
    won: false,
    fled: false,
    status: { buff_force: 0, buff_agility: 0, buff_defense: 0, regen: 0 },
    enemyStatus: [],
    cooldowns: {},
  };
}

export function getAbilitiesForClass(characterClass: string): CombatAbility[] {
  return ABILITIES[characterClass.toLowerCase()] || ABILITIES["guerrier"];
}