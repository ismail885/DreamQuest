
// Les définitions de classes sont centralisées dans
// lib/characters/classDefinitions.ts et ré-exportées ici
// pour la compatibilité descendante.

// Ré-exporter toutes les définitions depuis le fichier centralisé
// Note: 'export type' requis par isolatedModules
export {
  // Types (utiliser 'type' pour les exports de types)
  type CharacterClass,
  type CharacterAbility,
  type CharacterStats,
  type StatKey,
  type ClassInfo,
  type AbilityInfo,
  type AbilityType,
  type Difficulty,
  
  // Constantes (runtime values)
  CHARACTER_CLASSES,
  CLASS_ICONS,
  STAT_ICONS,
  STAT_LABELS,
  STAT_COLORS,
  CLASS_PASSIVES,
  ABILITIES_DATA,
  CLASS_DIFFICULTIES,
  DIFFICULTY_LABELS,
  
  calculateRequiredXP,
  getTotalXPForLevel,
  getClassAbilitiesWithInfo,
  getFormattedStats,
  validateCharacterName,
} from '@/lib/characters/classDefinitions';

export interface Character {
  id?: number;
  nom_personnage: string;
  classe: import('@/lib/characters/classDefinitions').CharacterClass;
  niveau: number;
  points_vie: number;
  points_vie_max: number;
  stats: import('@/lib/characters/classDefinitions').CharacterStats;
  id_utilisateur: number;
  date_creation?: string;
  experience?: number;
}

export interface CreateCharacterPayload {
  nom_personnage: string;
  classe: import('@/lib/characters/classDefinitions').CharacterClass;
  id_utilisateur: number;
}

