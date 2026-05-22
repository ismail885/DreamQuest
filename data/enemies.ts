// ============================================================
// DÉFINITIONS DES ENNEMIS — Source unique
// DreamQuest - RPG Textuel Interactif
// ============================================================

export type StatusEffect = "poison" | "stunned" | "buff_force" | "buff_agility" | "buff_defense" | "regen";

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

export const ENEMIES: Enemy[] = [
  { id: "gobelin", name: "Gobelin", description: "Une petite créature verdâtre", pv: 30, pvMax: 30, force: 8, agility: 10, intelligence: 4, xpReward: 20, loot: "couteau" },
  { id: "loup", name: "Loup", description: "Un loup affamé", pv: 40, pvMax: 40, force: 12, agility: 14, intelligence: 6, xpReward: 30, loot: "fourrure" },
  { id: "orc", name: "Orc", description: "Un guerrier orc", pv: 60, pvMax: 60, force: 18, agility: 8, intelligence: 8, xpReward: 50, loot: "hache" },
  { id: "squelette", name: "Squelette", description: "Un mort-vivant", pv: 35, pvMax: 35, force: 10, agility: 12, intelligence: 2, xpReward: 25, loot: "os" },
  { id: "sorciere", name: "Sorcière", description: "Une magicienne sombre", pv: 25, pvMax: 25, force: 6, agility: 10, intelligence: 20, xpReward: 40, loot: "potion" },
  { id: "troll", name: "Troll", description: "Un troll des montagnes", pv: 80, pvMax: 80, force: 22, agility: 4, intelligence: 4, xpReward: 70, loot: "peau" },
  { id: "dragon", name: "Jeune Dragon", description: "Un dragon affamé", pv: 100, pvMax: 100, force: 25, agility: 12, intelligence: 14, xpReward: 100, loot: "ecaille" },
];
