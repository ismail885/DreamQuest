export const MAX_LEVEL = 100;

export interface SeasonConfig {
  id: number;
  name: string;
  description: string;
  xpMultiplier: number;
  questPool: string[];
  startDate: string;
  endDate: string;
}

export const SEASONS: Record<number, SeasonConfig> = {
  1: {
    id: 1,
    name: "L'Éveil des Héros",
    description: "Les portes de l'aventure s'ouvrent… L'ancien monde vous attend.",
    xpMultiplier: 1.0,
    questPool: ["finish_2", "finish_1", "vote_3", "create_char", "play_story"],
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  },
};

export function getCurrentSeason(): SeasonConfig {
  return SEASONS[1];
}

export function getSeasonById(id: number): SeasonConfig | null {
  return SEASONS[id] ?? null;
}

export function isValidLevel(level: number): boolean {
  return level >= 1 && level <= MAX_LEVEL;
}

export function getPrestigeTitle(bestLevel: number): string {
  if (bestLevel >= 100) return "Légende Vivante";
  if (bestLevel >= 85) return "Seigneur Suprême";
  if (bestLevel >= 70) return "Maître Absolu";
  if (bestLevel >= 55) return "Élite Légendaire";
  if (bestLevel >= 40) return "Vétéran Aguerri";
  if (bestLevel >= 25) return "Aventurier Confirmé";
  if (bestLevel >= 15) return "Guerrier Prometteur";
  return "Apprenti Aventurier";
}
