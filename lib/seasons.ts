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
    questPool: ["finish_2", "finish_1", "finish_5", "vote_3", "vote_1", "create_char", "play_story", "combat_win", "create_story", "level_up"],
    startDate: "2026-01-01",
    endDate: "2026-03-31",
  },
  2: {
    id: 2,
    name: "La Flamme des Légendes",
    description: "Les braises du passé ravivent les héros d'antan.",
    xpMultiplier: 1.2,
    questPool: ["finish_2", "finish_1", "finish_5", "vote_3", "vote_1", "play_story", "combat_win", "create_story", "level_up"],
    startDate: "2026-04-01",
    endDate: "2026-06-30",
  },
  3: {
    id: 3,
    name: "L'Ombre du Néant",
    description: "Une brume maléfique s'abat sur le royaume… seuls les plus courageux résisteront.",
    xpMultiplier: 1.0,
    questPool: ["finish_2", "finish_1", "finish_5", "create_char", "play_story", "combat_win", "level_up"],
    startDate: "2026-07-01",
    endDate: "2026-09-30",
  },
  4: {
    id: 4,
    name: "L'Apogée des Dieux",
    description: "Les dieux eux-mêmes descendent sur le plan mortel. La bataille finale commence.",
    xpMultiplier: 1.5,
    questPool: ["finish_2", "finish_1", "finish_5", "vote_3", "vote_1", "create_char", "play_story", "combat_win", "create_story", "level_up"],
    startDate: "2026-10-01",
    endDate: "2026-12-31",
  },
};

export function getCurrentSeason(): SeasonConfig {
  const now = new Date();
  const allSeasons = Object.values(SEASONS);

  for (const season of allSeasons) {
    const start = new Date(season.startDate);
    const end = new Date(season.endDate);
    if (now >= start && now <= end) {
      return season;
    }
  }

  // Fallback : retourne la dernière saison si hors calendrier
  return allSeasons[allSeasons.length - 1] ?? allSeasons[0];
}

export function getSeasonById(id: number): SeasonConfig | null {
  return SEASONS[id] ?? null;
}


