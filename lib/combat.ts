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
}

export interface CombatState {
  inCombat: boolean;
  enemy: Enemy | null;
  playerPv: number;
  playerPvMax: number;
  turn: "player" | "enemy";
  log: string[];
  won: boolean;
  fled: boolean;
}

const ENEMIES: Enemy[] = [
  { id: "gobelin", name: "Gobelin", description: "Una petite creature veratre", pv: 30, pvMax: 30, force: 8, agility: 10, intelligence: 4, xpReward: 20, loot: "couteau" },
  { id: "loup", name: "Loup", description: "Un loup affame", pv: 40, pvMax: 40, force: 12, agility: 14, intelligence: 6, xpReward: 30, loot: "fourrure" },
  { id: "orc", name: "Orc", description: "Un guerrier orc", pv: 60, pvMax: 60, force: 18, agility: 8, intelligence: 8, xpReward: 50, loot: "hache" },
  { id: "squelette", name: "Squelette", description: "Un mort-vivant", pv: 35, pvMax: 35, force: 10, agility: 12, intelligence: 2, xpReward: 25, loot: "os" },
  { id: "sorciere", name: "Sorciere", description: "Une magicienne sombre", pv: 25, pvMax: 25, force: 6, agility: 10, intelligence: 20, xpReward: 40, loot: "potion" },
  { id: "troll", name: "Troll", description: "Un troll des montagnes", pv: 80, pvMax: 80, force: 22, agility: 4, intelligence: 4, xpReward: 70, loot: "peau" },
  { id: "dragon", name: "Jeune Dragon", description: "Un dragon affame", pv: 100, pvMax: 100, force: 25, agility: 12, intelligence: 14, xpReward: 100, loot: "ecaille" },
];

export function getRandomEnemy(level: number = 1): Enemy {
  const filtered = ENEMIES.filter(e => e.xpReward <= level * 40 + 30);
  const pool = filtered.length > 0 ? filtered : ENEMIES;
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function getEnemyById(id: string): Enemy | undefined {
  return ENEMIES.find(e => e.id === id);
}

export function initCombat(playerPvMax: number, level: number = 1): CombatState {
  const enemy = getRandomEnemy(level);
  return {
    inCombat: false,
    enemy,
    playerPv: playerPvMax,
    playerPvMax: playerPvMax,
    turn: "player",
    log: [`Un ${enemy.name} apparait!`],
    won: false,
    fled: false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function playerAttack(stats: { force: number; agility: number; intelligence: number }, _enemy: Enemy): { dmg: number; log: string } {
  const baseDmg = stats.force + Math.floor(stats.agility / 2);
  const crit = Math.random() < stats.agility / 100;
  const dmg = Math.max(1, baseDmg + (crit ? Math.floor(baseDmg * 0.5) : 0));
  return {
    dmg,
    log: crit ? `Coup critique! Tu infliges ${dmg} degats!` : `Tu frappes pour ${dmg} degats.`,
  };
}

export function playerDefense(stats: { agility: number; endurance: number }): { reduction: number } {
  const reduction = Math.floor((stats.agility + stats.endurance) / 4);
  return { reduction };
}

export function enemyAttack(enemy: Enemy): { dmg: number; log: string } {
  const baseDmg = enemy.force + Math.floor(enemy.agility / 2);
  const dmg = Math.max(1, baseDmg);
  return { dmg, log: `${enemy.name} attaque pour ${dmg} degats!` };
}

export function useCombatState(initialPlayerPv: number, level: number = 1): CombatState {
  const enemy = getRandomEnemy(level);
  return {
    inCombat: true,
    enemy: { ...enemy },
    playerPv: initialPlayerPv,
    playerPvMax: initialPlayerPv,
    turn: "player",
    log: [`Un ${enemy.name} apparait!${enemy.description ? " (" + enemy.description + ")" : ""}`],
    won: false,
    fled: false,
  };
}