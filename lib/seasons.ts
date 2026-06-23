export const MAX_LEVEL = 100;

export interface SeasonMode {
  name: string;
  rule: string;
}

export interface SeasonConfig {
  id: number;
  name: string;
  description: string;
  xpMultiplier: number;
  // Multiplicateur appliqué aux dégâts du joueur en combat (>1 bonus, <1 malus).
  playerDamageMultiplier: number;
  mode: SeasonMode;
  bonuses: string[];
  maluses: string[];
  questPool: string[];
  startMonth: number; // mois de début (0-11), saison = 3 mois
}

export const SEASONS: Record<number, SeasonConfig> = {
  1: {
    id: 1,
    name: "L'Éveil des Héros",
    description: "Les portes de l'aventure s'ouvrent… L'ancien monde vous attend.",
    xpMultiplier: 1.0,
    playerDamageMultiplier: 1.1,
    mode: { name: "Initiation", rule: "Démarrage en douceur : vos coups portent plus fort, aucun malus." },
    bonuses: ["+10% de dégâts en combat"],
    maluses: [],
    questPool: ["finish_2", "finish_1", "finish_5", "vote_3", "vote_1", "create_char", "play_story", "combat_win", "create_story", "level_up"],
    startMonth: 0,
  },
  2: {
    id: 2,
    name: "La Flamme des Légendes",
    description: "Les braises du passé ravivent les héros d'antan.",
    xpMultiplier: 1.2,
    playerDamageMultiplier: 0.9,
    mode: { name: "Ferveur", rule: "+20% d'XP, mais l'ardeur épuise : -10% de dégâts." },
    bonuses: ["+20% d'XP"],
    maluses: ["-10% de dégâts en combat"],
    questPool: ["finish_2", "finish_1", "finish_5", "vote_3", "vote_1", "play_story", "combat_win", "create_story", "level_up"],
    startMonth: 3,
  },
  3: {
    id: 3,
    name: "L'Ombre du Néant",
    description: "Une brume maléfique s'abat sur le royaume… seuls les plus courageux résisteront.",
    xpMultiplier: 1.3,
    playerDamageMultiplier: 0.75,
    mode: { name: "Survie", rule: "+30% d'XP pour récompenser le risque, mais l'obscurité affaiblit : -25% de dégâts." },
    bonuses: ["+30% d'XP"],
    maluses: ["-25% de dégâts en combat"],
    questPool: ["finish_2", "finish_1", "finish_5", "create_char", "play_story", "combat_win", "level_up"],
    startMonth: 6,
  },
  4: {
    id: 4,
    name: "L'Apogée des Dieux",
    description: "Les dieux eux-mêmes descendent sur le plan mortel. La bataille finale commence.",
    xpMultiplier: 1.5,
    playerDamageMultiplier: 0.85,
    mode: { name: "Légendaire", rule: "+50% d'XP, mais les dieux jugent les mortels : -15% de dégâts." },
    bonuses: ["+50% d'XP"],
    maluses: ["-15% de dégâts en combat"],
    questPool: ["finish_2", "finish_1", "finish_5", "vote_3", "vote_1", "create_char", "play_story", "combat_win", "create_story", "level_up"],
    startMonth: 9,
  },
};

// Saison déterminée par le trimestre courant (cycle de 3 mois, indépendant de l'année).
export function getCurrentSeason(): SeasonConfig {
  const month = new Date().getMonth();
  const id = Math.floor(month / 3) + 1;
  return SEASONS[id] ?? SEASONS[1];
}

export function getSeasonById(id: number): SeasonConfig | null {
  return SEASONS[id] ?? null;
}

// Dates de début/fin de la saison pour l'année en cours (affichage).
export function getSeasonDates(season: SeasonConfig, year = new Date().getFullYear()): { start: Date; end: Date } {
  const start = new Date(year, season.startMonth, 1);
  const end = new Date(year, season.startMonth + 3, 0);
  return { start, end };
}
