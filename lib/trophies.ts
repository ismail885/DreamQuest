import { SEASONS, getCurrentSeason } from "@/lib/seasons";

// Trophées saisonniers statiques, calculés à la volée (aucune table).
// 5 paliers par saison, cumulant 5000 points/saison.
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

export const RARITY_LABELS: Record<TrophyRarity, string> = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
  legendaire: "Légendaire",
};

// Points et rareté par palier (5 paliers → 200+400+800+1600+2000 = 5000 / saison).
const TIER_POINTS = [200, 400, 800, 1600, 2000];
const TIER_RARITY: TrophyRarity[] = ["bronze", "bronze", "argent", "or", "legendaire"];
const ROMAN = ["I", "II", "III", "IV", "V"];

export const SEASON_POINTS_CAP = TIER_POINTS.reduce((s, p) => s + p, 0); // 5000

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
  progress: number;
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

interface SeasonTrack {
  metric: Metric;
  icon: string;
  label: string;
  goals: [number, number, number, number, number];
}

// Un objectif progressif par saison (métriques globales, paliers croissants).
const SEASON_TRACKS: Record<number, SeasonTrack> = {
  1: { metric: "storiesPlayed", icon: "BookOpen", label: "Aventures terminées", goals: [1, 2, 4, 7, 12] },
  2: { metric: "level", icon: "TrendingUp", label: "Niveau atteint", goals: [3, 6, 10, 15, 22] },
  3: { metric: "charactersCreated", icon: "UserPlus", label: "Personnages créés", goals: [1, 2, 3, 4, 6] },
  4: { metric: "storiesPlayed", icon: "Flame", label: "Aventures terminées", goals: [3, 6, 10, 16, 25] },
  5: { metric: "votes", icon: "ThumbsUp", label: "Votes donnés", goals: [1, 5, 12, 25, 45] },
  6: { metric: "level", icon: "Zap", label: "Niveau atteint", goals: [10, 18, 28, 40, 55] },
  7: { metric: "storiesCreated", icon: "Feather", label: "Aventures publiées", goals: [1, 2, 4, 7, 12] },
  8: { metric: "storiesPlayed", icon: "Trophy", label: "Aventures terminées", goals: [5, 10, 18, 30, 50] },
  9: { metric: "level", icon: "Moon", label: "Niveau atteint", goals: [20, 32, 48, 68, 90] },
  10: { metric: "totalLikes", icon: "Star", label: "Votes reçus", goals: [10, 30, 70, 140, 250] },
  11: { metric: "storiesPlayed", icon: "Crown", label: "Aventures terminées", goals: [8, 16, 28, 45, 70] },
  12: { metric: "level", icon: "Infinity", label: "Niveau atteint", goals: [40, 60, 80, 95, 100] },
};

export function calculateTrophies(stats: TrophyStatsInput): UserTrophies {
  const currentSeasonId = getCurrentSeason().id;
  const trophies: Trophy[] = [];

  for (const [seasonIdStr, track] of Object.entries(SEASON_TRACKS)) {
    const seasonId = Number(seasonIdStr);
    const seasonName = SEASONS[seasonId]?.name ?? `Saison ${seasonId}`;
    const value = stats[track.metric] ?? 0;

    track.goals.forEach((goal, tier) => {
      trophies.push({
        id: `s${seasonId}_t${tier}`,
        seasonId,
        seasonName,
        title: `${track.label} ${ROMAN[tier]}`,
        description: `Atteindre ${goal} — ${track.label.toLowerCase()}`,
        icon: track.icon,
        rarity: TIER_RARITY[tier],
        points: TIER_POINTS[tier],
        current: Math.min(value, goal),
        goal,
        progress: goal > 0 ? Math.min(1, value / goal) : 0,
        unlocked: value >= goal,
        fromCurrentSeason: seasonId === currentSeasonId,
      });
    });
  }

  const unlocked = trophies.filter((t) => t.unlocked);
  return {
    totalUnlocked: unlocked.length,
    total: trophies.length,
    totalPoints: unlocked.reduce((s, t) => s + t.points, 0),
    maxPoints: trophies.reduce((s, t) => s + t.points, 0),
    trophies,
  };
}
