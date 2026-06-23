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
  // Multiplicateur des dégâts du joueur en combat (>1 bonus, <1 malus).
  playerDamageMultiplier: number;
  mode: SeasonMode;
  bonuses: string[];
  maluses: string[];
  questPool: string[];
  startMonth: number; // 0-11 ; chaque saison dure 1 mois
}

const DEFAULT_QUEST_POOL = [
  "finish_2", "finish_1", "finish_5", "vote_3", "vote_1",
  "create_char", "play_story", "combat_win", "create_story", "level_up",
];

// Chaque saison applique UN SEUL effet : soit un bonus, soit un malus.
type Effect = { kind: "xp" | "dmg"; mult: number };

interface SeasonDef {
  name: string;
  description: string;
  effect: Effect;
}

const SEASON_DEFS: SeasonDef[] = [
  { name: "L'Aube des Commencements", description: "Le calme du renouveau : l'aventure repart d'un bon pied.", effect: { kind: "xp", mult: 1.15 } },
  { name: "Les Glaces de Givremort", description: "Le froid mordant engourdit les bras des héros.", effect: { kind: "dmg", mult: 0.85 } },
  { name: "Le Renouveau Sylvestre", description: "La sève monte, la vigueur revient dans les veines.", effect: { kind: "dmg", mult: 1.10 } },
  { name: "La Flamme des Légendes", description: "Les braises du passé ravivent les héros d'antan.", effect: { kind: "xp", mult: 1.25 } },
  { name: "Les Vents Trompeurs", description: "Des bourrasques imprévisibles déséquilibrent les coups.", effect: { kind: "dmg", mult: 0.80 } },
  { name: "Le Solstice Ardent", description: "Le soleil au zénith décuple la fougue guerrière.", effect: { kind: "dmg", mult: 1.20 } },
  { name: "La Canicule Maudite", description: "La chaleur écrasante épuise les corps et l'esprit.", effect: { kind: "xp", mult: 0.90 } },
  { name: "L'Âge d'Or", description: "Une ère faste où chaque exploit vaut double.", effect: { kind: "xp", mult: 1.30 } },
  { name: "L'Ombre du Néant", description: "Une brume maléfique affaiblit les plus courageux.", effect: { kind: "dmg", mult: 0.75 } },
  { name: "La Nuit des Spectres", description: "Les morts rôdent et brouillent la mémoire des vivants.", effect: { kind: "xp", mult: 0.85 } },
  { name: "La Moisson des Braves", description: "Le temps des récompenses pour les âmes vaillantes.", effect: { kind: "xp", mult: 1.20 } },
  { name: "L'Apogée des Dieux", description: "Les dieux descendent : la gloire ultime est à portée.", effect: { kind: "xp", mult: 1.50 } },
];

function pct(mult: number): string {
  return `${mult > 1 ? "+" : ""}${Math.round((mult - 1) * 100)}%`;
}

function buildSeason(def: SeasonDef, index: number): SeasonConfig {
  const { kind, mult } = def.effect;
  const isBonus = mult > 1;
  const label = kind === "xp" ? `${pct(mult)} d'XP` : `${pct(mult)} de dégâts`;
  return {
    id: index + 1,
    name: def.name,
    description: def.description,
    xpMultiplier: kind === "xp" ? mult : 1,
    playerDamageMultiplier: kind === "dmg" ? mult : 1,
    mode: { name: isBonus ? "Faste" : "Rude", rule: `${isBonus ? "Bonus" : "Malus"} du mois : ${label}.` },
    bonuses: isBonus ? [label] : [],
    maluses: isBonus ? [] : [label],
    questPool: DEFAULT_QUEST_POOL,
    startMonth: index,
  };
}

export const SEASONS: Record<number, SeasonConfig> = SEASON_DEFS.reduce(
  (acc, def, i) => {
    acc[i + 1] = buildSeason(def, i);
    return acc;
  },
  {} as Record<number, SeasonConfig>,
);

// Saison déterminée par le mois courant (cycle d'1 mois, indépendant de l'année).
export function getCurrentSeason(): SeasonConfig {
  const month = new Date().getMonth();
  return SEASONS[month + 1] ?? SEASONS[1];
}

export function getSeasonById(id: number): SeasonConfig | null {
  return SEASONS[id] ?? null;
}

export function getSeasonDates(season: SeasonConfig, year = new Date().getFullYear()): { start: Date; end: Date } {
  const start = new Date(year, season.startMonth, 1);
  const end = new Date(year, season.startMonth + 1, 0);
  return { start, end };
}
