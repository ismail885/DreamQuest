// Interface ennemie pour le système de combat (adaptée depuis lib/monsters.ts)
import { type Monster } from '@/lib/monsters';

export interface Enemy {
  id: string;
  name: string;
  description: string;
  level: number;
  hp: number;
  maxHp: number;
  pv: number;
  pvMax: number;
  attack: number;
  defense: number;
  force: number;
  agility: number;
  intelligence: number;
  xpReward: number;
  loot?: string;
}

export type StatusEffect = 'poison' | 'stunned' | 'bleeding' | 'burning' | 'buff_agility';

// Convertit un Monster en Enemy pour le système de combat
function monsterToEnemy(monster: Monster): Enemy {
  return {
    id: monster.id,
    name: monster.name,
    description: `Un ${monster.name} de niveau ${monster.level}`,
    level: monster.level,
    hp: monster.hp,
    maxHp: monster.hp,
    pv: monster.hp,
    pvMax: monster.hp,
    attack: monster.attack,
    defense: monster.defense,
    force: Math.floor(monster.attack * 0.7),
    agility: Math.floor(Math.random() * 5) + 3,
    intelligence: Math.floor(Math.random() * 5) + 1,
    xpReward: monster.reward,
  };
}

// Liste des ennemis convertis depuis les monstres de base
import { BASE_MONSTERS } from '@/lib/monsters';

export const ENEMIES: Enemy[] = BASE_MONSTERS.map(monsterToEnemy);

export function getRandomEnemy(level: number = 1): Enemy {
  const seuil = Math.max(30, level * 40 + 30);
  const filtered = ENEMIES.filter(e => e.xpReward <= seuil);
  const pool = filtered.length > 0 ? filtered : ENEMIES.slice(0, 1);
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function getEnemyById(id: string): Enemy | undefined {
  return ENEMIES.find(e => e.id === id);
}
