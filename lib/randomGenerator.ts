// API DE GENERATION ALEATOIRE POUR DREAMQUEST

import { CharacterClass, CharacterStats, CHARACTER_CLASSES, ClassInfo } from '@/types';
import { getPoolAbilityNames } from './abilities';

// Bonus de stats par niveau
export const LEVEL_BONUS: Record<number, Partial<CharacterStats>> = {
  2: { endurance: 1 },
  3: { force: 1 },
  4: { agility: 1 },
  5: { magie: 1 },
  6: { endurance: 2 },
  7: { force: 2 },
  8: { agility: 2 },
  9: { magie: 2 },
  10: { endurance: 3 },
  // Niveaux 11-20 : cycle avec valeurs croissantes
  11: { force: 3 },
  12: { agility: 3 },
  13: { magie: 3 },
  14: { endurance: 4, force: 1 },
  15: { force: 4, agility: 1 },
  16: { agility: 4, magie: 1 },
  17: { magie: 4, endurance: 1 },
  18: { endurance: 5, force: 2 },
  19: { force: 5, agility: 2 },
  20: { agility: 5, magie: 2 },
};

// Événements aléatoires dans les aventures
export const RANDOM_EVENTS = [
  {
    id: 'rencontre',
    text: 'Vous rencontrez un voyageur solitaire qui vous demande de l\'aide.',
    choices: [
      { text: 'Lui parler', consequence: { xp: 20, pv: 0, stat: null } },
      { text: 'L\'ignorer', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'L\'attaquer', consequence: { xp: 10, pv: -15, stat: 'force' } }
    ]
  },
  {
    id: 'tresor',
    text: 'Vous trouvez un coffre ancien!',
    choices: [
      { text: 'L\'ouvrir prudemment', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Le forcer', consequence: { xp: 5, pv: -5, stat: 'force' } },
      { text: 'L\'ignorer', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'piege',
    text: 'Vous tombez dans un piège!',
    choices: [
      { text: 'Esquiver', consequence: { xp: 10, pv: -10, stat: 'agility' } },
      { text: 'Briser les chaînes', consequence: { xp: 20, pv: -20, stat: 'force' } },
      { text: 'Appeler à l\'aide', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'magic',
    text: 'Une source de magie scintille devant vous.',
    choices: [
      { text: 'Boire', consequence: { xp: 25, pv: 20, stat: 'magie' } },
      { text: 'Collecter', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Ne pas y toucher', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'bestiole',
    text: 'Une créature mystérieuse apparaît!',
    choices: [
      { text: 'Combattre', consequence: { xp: 30, pv: -15, stat: 'force' } },
      { text: 'Fuir', consequence: { xp: 5, pv: 0, stat: 'agility' } },
      { text: 'Parler', consequence: { xp: 20, pv: 0, stat: 'magie' } }
    ]
  }
];

// Fonction principale de génération aléatoire
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

export function getRandomEvent(): typeof RANDOM_EVENTS[0] {
  return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
}
