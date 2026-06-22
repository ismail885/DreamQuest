import { SEASONS, getCurrentSeason } from "@/lib/seasons";

// Trophées saisonniers statiques, calculés à la volée (aucune table).
export interface TrophyStatsInput {
  storiesPlayed: number;
  charactersCreated: number;
  votes: number;
  storiesCreated: number;
  totalLikes: number;
  level: number;
}

export interface Trophy {
  id: string;
  seasonId: number;
  seasonName: string;
  title: string;
  description: string;
  icon: string; // nom d'icône lucide-react
  unlocked: boolean;
  fromCurrentSeason: boolean;
}

export interface UserTrophies {
  totalUnlocked: number;
  total: number;
  trophies: Trophy[];
}

interface TrophyDef {
  id: string;
  seasonId: number;
  title: string;
  description: string;
  icon: string;
  condition: (s: TrophyStatsInput) => boolean;
}

export const TROPHIES_CONFIG: TrophyDef[] = [
  // Saison 1 — L'Éveil des Héros
  { id: "eveil_heros", seasonId: 1, title: "Éveil du Héros", description: "Terminez votre première aventure", icon: "Sparkles", condition: (s) => s.storiesPlayed >= 1 },
  { id: "premiere_ascension", seasonId: 1, title: "Première Ascension", description: "Atteignez le niveau 5", icon: "TrendingUp", condition: (s) => s.level >= 5 },

  // Saison 2 — La Flamme des Légendes
  { id: "flamme_naissante", seasonId: 2, title: "Flamme Naissante", description: "Terminez 5 aventures", icon: "Flame", condition: (s) => s.storiesPlayed >= 5 },
  { id: "porte_flambeau", seasonId: 2, title: "Porte-Flambeau", description: "Atteignez le niveau 10", icon: "Zap", condition: (s) => s.level >= 10 },
  { id: "conteur_ardent", seasonId: 2, title: "Conteur Ardent", description: "Publiez une aventure", icon: "Feather", condition: (s) => s.storiesCreated >= 1 },

  // Saison 3 — L'Ombre du Néant
  { id: "survivant_ombres", seasonId: 3, title: "Survivant des Ombres", description: "Terminez 10 aventures", icon: "Skull", condition: (s) => s.storiesPlayed >= 10 },
  { id: "veilleur_neant", seasonId: 3, title: "Veilleur du Néant", description: "Atteignez le niveau 25", icon: "Moon", condition: (s) => s.level >= 25 },

  // Saison 4 — L'Apogée des Dieux
  { id: "legende_incarnee", seasonId: 4, title: "Légende Incarnée", description: "Terminez 20 aventures", icon: "Trophy", condition: (s) => s.storiesPlayed >= 20 },
  { id: "favori_dieux", seasonId: 4, title: "Favori des Dieux", description: "Atteignez le niveau 50", icon: "Crown", condition: (s) => s.level >= 50 },
  { id: "idole_pantheon", seasonId: 4, title: "Idole du Panthéon", description: "Cumulez 50 votes sur vos aventures", icon: "Star", condition: (s) => s.totalLikes >= 50 },
];

export function calculateTrophies(stats: TrophyStatsInput): UserTrophies {
  const currentSeasonId = getCurrentSeason().id;

  const trophies: Trophy[] = TROPHIES_CONFIG.map((def) => ({
    id: def.id,
    seasonId: def.seasonId,
    seasonName: SEASONS[def.seasonId]?.name ?? `Saison ${def.seasonId}`,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlocked: def.condition(stats),
    fromCurrentSeason: def.seasonId === currentSeasonId,
  }));

  return {
    totalUnlocked: trophies.filter((t) => t.unlocked).length,
    total: trophies.length,
    trophies,
  };
}
