// Monstres pour les combats - stockés en localStorage
// Ces monstres sont générés procéduralement selon le niveau du personnage

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  reward: number;
  type: 'beast' | 'human' | 'undead' | 'demon' | 'elemental';
}

// Monstres de base par niveau
export const BASE_MONSTERS: Monster[] = [
  { id: 'loup', name: 'Loup affamé', level: 1, hp: 30, attack: 5, defense: 2, reward: 20, type: 'beast' },
  { id: 'gobelin', name: 'Gobelin', level: 1, hp: 25, attack: 4, defense: 1, reward: 15, type: 'human' },
  { id: 'rat_geant', name: 'Rat géant', level: 1, hp: 20, attack: 3, defense: 1, reward: 10, type: 'beast' },
  { id: 'chauve_souris', name: 'Chauve-souris vampire', level: 1, hp: 15, attack: 4, defense: 0, reward: 12, type: 'beast' },
  { id: 'spider', name: 'Araignée géante', level: 2, hp: 35, attack: 6, defense: 2, reward: 25, type: 'beast' },
  { id: 'serpent', name: 'Serpent venimeux', level: 2, hp: 28, attack: 5, defense: 1, reward: 18, type: 'beast' },
  { id: 'zombie', name: 'Zombie errant', level: 2, hp: 40, attack: 4, defense: 2, reward: 16, type: 'undead' },

  { id: 'gobelin_archer', name: 'Gobelin archer', level: 3, hp: 35, attack: 7, defense: 2, reward: 28, type: 'human' },
  { id: 'loup_alpha', name: 'Loup alpha', level: 3, hp: 48, attack: 8, defense: 3, reward: 32, type: 'beast' },
  { id: 'spectre', name: 'Spectre', level: 3, hp: 30, attack: 6, defense: 1, reward: 24, type: 'undead' },

  { id: 'orque', name: 'Orque guerrier', level: 4, hp: 60, attack: 10, defense: 4, reward: 45, type: 'human' },
  { id: 'squelette', name: 'Squelette combattant', level: 4, hp: 45, attack: 8, defense: 3, reward: 35, type: 'undead' },
  { id: 'loup_garou', name: 'Loup-garou', level: 5, hp: 70, attack: 12, defense: 5, reward: 55, type: 'beast' },
  { id: 'bandit', name: 'Bandit', level: 4, hp: 50, attack: 9, defense: 3, reward: 40, type: 'human' },
  { id: 'troll', name: 'Troll des cavernes', level: 6, hp: 90, attack: 14, defense: 6, reward: 70, type: 'beast' },

  { id: 'necromancien', name: 'Nécromancien', level: 7, hp: 65, attack: 15, defense: 4, reward: 85, type: 'undead' },
  { id: 'ogre', name: 'Ogre', level: 7, hp: 100, attack: 16, defense: 7, reward: 90, type: 'beast' },
  { id: 'vampire', name: 'Vampire', level: 8, hp: 80, attack: 18, defense: 5, reward: 100, type: 'undead' },
  { id: 'demon_klein', name: 'Démon mineur', level: 9, hp: 95, attack: 20, defense: 6, reward: 120, type: 'demon' },
  { id: 'elementaire', name: 'Élémentaire de feu', level: 8, hp: 85, attack: 17, defense: 5, reward: 95, type: 'elemental' },

  { id: 'dragon_juvénile', name: 'Dragon juvénile', level: 10, hp: 200, attack: 25, defense: 10, reward: 200, type: 'beast' },
  { id: 'demon_superieur', name: 'Démon supérieur', level: 12, hp: 180, attack: 28, defense: 8, reward: 250, type: 'demon' },
  { id: 'liche', name: 'Liche', level: 11, hp: 150, attack: 22, defense: 6, reward: 180, type: 'undead' },
  { id: 'golem_fer', name: 'Golem de fer', level: 10, hp: 250, attack: 20, defense: 15, reward: 220, type: 'elemental' },
];

const LOCALSTORAGE_KEY = 'dreamquest_monsters';

/**
 * Récupère les monstres depuis le localStorage
 * Si vide, initialise avec les monstres de base
 */
export function getMonsters(): Monster[] {
  if (typeof window === 'undefined') return BASE_MONSTERS;

  try {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(BASE_MONSTERS));
      return BASE_MONSTERS;
    }
    return JSON.parse(stored);
  } catch {
    return BASE_MONSTERS;
  }
}

/**
 * Récupère un monstre aléatoire adapté au niveau du personnage
 */
export function getRandomMonster(playerLevel: number): Monster {
  const monsters = getMonsters();

  const appropriateMonsters = monsters.filter(
    m => m.level >= playerLevel - 2 && m.level <= playerLevel + 3
  );

  const validMonsters = appropriateMonsters.length > 0
    ? appropriateMonsters
    : monsters.filter(m => m.level <= playerLevel + 5);

  return validMonsters[Math.floor(Math.random() * validMonsters.length)];
}

/**
 * Récupère un monstre par ID
 */
export function getMonsterById(id: string): Monster | undefined {
  const monsters = getMonsters();
  return monsters.find(m => m.id === id);
}

/**
 * Ajoute un nouveau monstre personnalisé
 */
export function addCustomMonster(monster: Monster): void {
  const monsters = getMonsters();
  monsters.push(monster);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(monsters));
}

/**
 * Supprime un monstre par ID
 */
export function removeMonster(id: string): void {
  const monsters = getMonsters();
  const filtered = monsters.filter(m => m.id !== id);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Réinitialise les monstres aux valeurs de base
 */
export function resetMonsters(): void {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(BASE_MONSTERS));
}
