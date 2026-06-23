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

export type TrophyRarity = "bronze" | "argent" | "or" | "legendaire";
type Metric = keyof TrophyStatsInput;

export const RARITY_POINTS: Record<TrophyRarity, number> = {
  bronze: 10,
  argent: 25,
  or: 50,
  legendaire: 100,
};

export const RARITY_LABELS: Record<TrophyRarity, string> = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  legendaire: "Légendaire",
};

export interface Trophy {
  id: string;
  seasonId: number;
  seasonName: string;
  title: string;
  description: string;
  icon: string;
  rarity: TrophyRarity;
  points: number;
  current: number;
  goal: number;
  progress: number; // 0 → 1
  unlocked: boolean;
  fromCurrentSeason: boolean;
}

export interface UserTrophies {
  totalUnlocked: number;
  total: number;
  totalPoints: number;
  maxPoints: number;
  trophies: Trophy[];
}

interface TrophyDef {
  id: string;
  seasonId: number;
  title: string;
  description: string;
  icon: string;
  rarity: TrophyRarity;
  metric: Metric;
  goal: number;
}

export const TROPHIES_CONFIG: TrophyDef[] = [
  // Saison 1 — L'Éveil des Héros
  { id: "eveil_heros", seasonId: 1, title: "Éveil du Héros", description: "Terminez votre première aventure", icon: "Sparkles", rarity: "bronze", metric: "storiesPlayed", goal: 1 },
  { id: "ame_curieuse", seasonId: 1, title: "Âme Curieuse", description: "Créez votre premier personnage", icon: "UserPlus", rarity: "bronze", metric: "charactersCreated", goal: 1 },
  { id: "premiere_ascension", seasonId: 1, title: "Première Ascension", description: "Atteignez le niveau 5", icon: "TrendingUp", rarity: "bronze", metric: "level", goal: 5 },

  // Saison 2 — La Flamme des Légendes
  { id: "flamme_naissante", seasonId: 2, title: "Flamme Naissante", description: "Terminez 5 aventures", icon: "Flame", rarity: "argent", metric: "storiesPlayed", goal: 5 },
  { id: "porte_flambeau", seasonId: 2, title: "Porte-Flambeau", description: "Atteignez le niveau 10", icon: "Zap", rarity: "argent", metric: "level", goal: 10 },
  { id: "conteur_ardent", seasonId: 2, title: "Conteur Ardent", description: "Publiez une aventure", icon: "Feather", rarity: "argent", metric: "storiesCreated", goal: 1 },
  { id: "voix_du_peuple", seasonId: 2, title: "Voix du Peuple", description: "Votez pour 10 aventures", icon: "ThumbsUp", rarity: "bronze", metric: "votes", goal: 10 },

  // Saison 3 — L'Ombre du Néant
  { id: "survivant_ombres", seasonId: 3, title: "Survivant des Ombres", description: "Terminez 10 aventures", icon: "Skull", rarity: "or", metric: "storiesPlayed", goal: 10 },
  { id: "veilleur_neant", seasonId: 3, title: "Veilleur du Néant", description: "Atteignez le niveau 25", icon: "Moon", rarity: "or", metric: "level", goal: 25 },
  { id: "scribe_des_tenebres", seasonId: 3, title: "Scribe des Ténèbres", description: "Publiez 3 aventures", icon: "Feather", rarity: "argent", metric: "storiesCreated", goal: 3 },

  // Saison 4 — L'Apogée des Dieux
  { id: "legende_incarnee", seasonId: 4, title: "Légende Incarnée", description: "Terminez 20 aventures", icon: "Trophy", rarity: "legendaire", metric: "storiesPlayed", goal: 20 },
  { id: "favori_dieux", seasonId: 4, title: "Favori des Dieux", description: "Atteignez le niveau 50", icon: "Crown", rarity: "legendaire", metric: "level", goal: 50 },
  { id: "idole_pantheon", seasonId: 4, title: "Idole du Panthéon", description: "Cumulez 50 votes sur vos aventures", icon: "Star", rarity: "or", metric: "totalLikes", goal: 50 },
  { id: "immortel", seasonId: 4, title: "Immortel", description: "Atteignez le niveau maximum (100)", icon: "Infinity", rarity: "legendaire", metric: "level", goal: 100 },
];

export function calculateTrophies(stats: TrophyStatsInput): UserTrophies {
  const currentSeasonId = getCurrentSeason().id;

  const trophies: Trophy[] = TROPHIES_CONFIG.map((def) => {
    const current = stats[def.metric] ?? 0;
    const unlocked = current >= def.goal;
    return {
      id: def.id,
      seasonId: def.seasonId,
      seasonName: SEASONS[def.seasonId]?.name ?? `Saison ${def.seasonId}`,
      title: def.title,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      points: RARITY_POINTS[def.rarity],
      current: Math.min(current, def.goal),
      goal: def.goal,
      progress: def.goal > 0 ? Math.min(1, current / def.goal) : 0,
      unlocked,
      fromCurrentSeason: def.seasonId === currentSeasonId,
    };
  });

  return {
    totalUnlocked: trophies.filter((t) => t.unlocked).length,
    total: trophies.length,
    totalPoints: trophies.filter((t) => t.unlocked).reduce((s, t) => s + t.points, 0),
    maxPoints: trophies.reduce((s, t) => s + t.points, 0),
    trophies,
  };
}
