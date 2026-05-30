import { CharacterClass, CharacterStats, CHARACTER_CLASSES, ClassInfo } from '@/types';
import { getPoolAbilityNames } from './abilities';

/**
 * Génère des stats aléatoires pour une classe, avec variation qui augmente avec le niveau.
 */
export function generateRandomStats(
  classe: CharacterClass,
  niveau: number = 1,
): CharacterStats {
  const classInfo = CHARACTER_CLASSES[classe] as ClassInfo | undefined;
  const base = classInfo?.baseStats ?? { force: 5, agility: 5, magie: 5, endurance: 5 };

  const bonusPerLevel = Math.floor((niveau - 1) / 3);
  const variance = Math.min(1 + Math.floor(niveau / 5), 5);

  const rollStat = (base: number): number => {
    const value = base + bonusPerLevel + Math.floor(Math.random() * variance);
    return Math.max(1, value);
  };

  return {
    force: rollStat(base.force),
    agility: rollStat(base.agility),
    magie: rollStat(base.magie),
    endurance: rollStat(base.endurance),
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

/**
 * Retourne les capacités débloquées en fonction du niveau.
 * Distribution progressive sur 100 niveaux.
 * Les capacités déjà possédées sont ignorées (pas de doublon).
 */
export function getAbilitiesForLevel(
  classe: CharacterClass,
  niveau: number,
  ownedAbilities: string[] = [],
): string[] {
  const unlockThresholds = [2, 4, 7, 10, 15, 20, 30, 40, 50, 60, 75, 90];
  const abilities: string[] = [];

  for (const threshold of unlockThresholds) {
    if (niveau < threshold) break;
    const alreadyHas = abilities.concat(ownedAbilities);
    const ability = getRandomAbility(classe, alreadyHas);
    abilities.push(ability);
  }

  return abilities;
}

/**
 * Génère un nom de personnage fantasy aléatoire.
 */
export function generateCharacterName(): string {
  const prefixes = [
    'Ael', 'Bel', 'Cael', 'Dorn', 'El', 'Fael', 'Gor', 'Hael', 'Ith', 'Jor',
    'Kael', 'Lor', 'Mor', 'Ner', 'Orin', 'Pyr', 'Rael', 'Sor', 'Thor', 'Ul',
    'Val', 'Wyn', 'Xan', 'Yor', 'Zar', 'Ald', 'Bran', 'Cor', 'Dra', 'Ery',
  ];
  const middles = [
    'a', 'e', 'i', 'o', 'u', 'ar', 'an', 'en', 'in', 'or',
    'ael', 'orn', 'und', 'mar', 'vyn', 'wyn', 'rik', 'dal',
  ];
  const suffixes = [
    'ian', 'ar', 'is', 'os', 'as', 'or', 'ak', 'on', 'id', 'um',
    'thor', 'mir', 'dil', 'ron', 'gar', 'wyn', 'ric', 'mund',
  ];

  const pattern = Math.floor(Math.random() * 3);
  let name = '';

  if (pattern === 0) {
    name = prefixes[Math.floor(Math.random() * prefixes.length)]
      + suffixes[Math.floor(Math.random() * suffixes.length)];
  } else if (pattern === 1) {
    name = prefixes[Math.floor(Math.random() * prefixes.length)]
      + middles[Math.floor(Math.random() * middles.length)]
      + suffixes[Math.floor(Math.random() * suffixes.length)];
  } else {
    name = prefixes[Math.floor(Math.random() * prefixes.length)]
      + middles[Math.floor(Math.random() * middles.length)];
  }

  return name;
}

/**
 * Génère un titre d'aventure fantasy.
 */
export function generateAdventureTitle(): string {
  const articles = ['Le', 'La', "L'", 'Les'];
  const adjs = [
    'Dernier', 'Ancien', 'Sombre', 'Lumineux', 'Sacré', 'Perdu', 'Caché',
    'Brûlant', 'Gelé', 'Interdit', 'Maudit', 'Éternel', 'Brisé', 'Secret',
    'Abyssal', 'Céleste', 'Royale', 'Oubliée', 'Émeraude', 'Cramoisi',
  ];
  const nouns = [
    'Trône', 'Royaume', 'Forêt', 'Temple', 'Crypte', 'Tour', 'Pont',
    'Portail', 'Miroir', 'Couronne', 'Épée', 'Grimoire', 'Relique',
    'Sanctuaire', 'Citadelle', 'Prophétie', 'Légende', 'Chevalier',
    'Dragon', 'Phénix', 'Ombre', 'Lumière', 'Abîme', 'Nécropole',
  ];
  const complements = [
    'du Destin', 'des Ombres', 'de Glace', 'de Feu', 'du Temps',
    'des Anciens', 'd\'Argent', 'de Cristal', 'des Rois', 'des Songes',
    'du Crépuscule', 'de l\'Aube', 'des Abysses', 'du Néant',
  ];

  const article = articles[Math.floor(Math.random() * articles.length)];
  const adj = adjs[Math.floor(Math.random() * adjs.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const complement = complements[Math.floor(Math.random() * complements.length)];

  const patterns = [
    `${article} ${adj} ${noun}`,
    `${article} ${noun} ${complement}`,
    `${adj} ${noun} ${complement}`,
  ];

  const title = patterns[Math.floor(Math.random() * patterns.length)];
  if (title.startsWith("L'")) {
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  }
  return title;
}
