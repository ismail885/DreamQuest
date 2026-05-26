import type { CharacterStats } from '@/types';

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
