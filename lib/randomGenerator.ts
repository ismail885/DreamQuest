// API DE GENERATION ALEATOIRE POUR DREAMQUEST

import { CharacterClass, CharacterStats, CHARACTER_CLASSES, ClassInfo } from '@/types';
import { getPoolAbilityNames } from './abilities';

export function generateRandomStats(classe: CharacterClass): CharacterStats {
  const classInfo = CHARACTER_CLASSES[classe] as ClassInfo | undefined;
  const base = classInfo?.baseStats ?? { force: 5, agility: 5, magie: 5, endurance: 5 };
  const variation = {
    force: Math.floor(Math.random() * 3) - 1,
    agility: Math.floor(Math.random() * 3) - 1,
    magie: Math.floor(Math.random() * 3) - 1,
    endurance: Math.floor(Math.random() * 3) - 1
  };

  return {
    force: Math.max(1, base.force + variation.force),
    agility: Math.max(1, base.agility + variation.agility),
    magie: Math.max(1, base.magie + variation.magie),
    endurance: Math.max(1, base.endurance + variation.endurance)
  };
}

export function getRandomAbility(classe: CharacterClass, ownedAbilities: string[] = []): string {
  const pool = getPoolAbilityNames(classe);
  const available = pool.filter(a => !ownedAbilities.includes(a));
  
  if (available.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAbilitiesForLevel(classe: CharacterClass, niveau: number, _ownedAbilities: string[] = []): string[] {
  const abilities: string[] = [];
  
  if (niveau >= 4) {
    abilities.push(getRandomAbility(classe, abilities));
  }
  
  if (niveau >= 7) {
    abilities.push(getRandomAbility(classe, abilities));
  }
  
  if (niveau >= 10) {
    abilities.push(getRandomAbility(classe, abilities));
  }
  
  return abilities;
}
