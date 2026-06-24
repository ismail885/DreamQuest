import { THEMES, THEME_ORDER } from "./themes";
import { GENRES } from "./genres";
import type {
  AventureGeneree,
  ChoixGenere,
  CompositionInput,
  ConsequenceGeneree,
  Difficulte,
  GenreData,
  GenreNom,
  NoeudGenere,
  ThemeData,
} from "./types";

const GENRES_VALIDES: GenreNom[] = [
  "Fantasy", "Dark Fantasy", "Mythologique", "Flibuste", "Intrigue de Cour",
  "Marches Sauvages", "Conte Féerique", "Épopée Guerrière", "Arcane & Reliques",
];

const DIFFICULTES_VALIDES: Difficulte[] = ["facile", "normal", "difficile", "legendaire"];

// Nombre de noeuds d'histoire (hors fins) selon la difficulte : min/max inclus.
const TAILLE_PAR_DIFFICULTE: Record<Difficulte, [number, number]> = {
  facile: [4, 6],
  normal: [6, 8],
  difficile: [8, 10],
  legendaire: [9, 12],
};

const NIVEAUX_PAR_DIFFICULTE: Record<Difficulte, [number, number]> = {
  facile: [1, 3],
  normal: [3, 5],
  difficile: [5, 8],
  legendaire: [8, 99],
};

const CLOTURE_DIFFICULTE: Record<Difficulte, string> = {
  facile: "Une chance réelle s'offre à l'aventurier courageux.",
  normal: "Seul un guerrier expérimenté en sortira indemne.",
  difficile: "Il faudra un héros chevronné pour survivre à cette épreuve.",
  legendaire: "Seule une âme prête au sacrifice peut espérer en revenir.",
};

const FIN_TRIOMPHE = [
  "Contre toute attente, vous triomphez. Le souvenir de {lieu} vous suivra comme une légende.",
  "L'épreuve s'achève sur une victoire chèrement acquise. {antagoniste} ne menacera plus personne.",
];
const FIN_AMERE = [
  "Vous survivez, mais marqué à jamais. Certaines histoires ne se terminent pas comme on l'espère.",
  "Le destin en a décidé autrement : vous quittez {lieu} en laissant une part de vous derrière.",
];

interface Ctx {
  titre: string;
  lieu: string;
  lieuHabille: string;
  decor: string;
  antagoniste: string;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Element a l'index i en bouclant sur le tableau (cyclique).
function at<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function normaliser(texte: string): string {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function detecterTheme(titre: string): ThemeData {
  const t = normaliser(titre);
  for (const id of THEME_ORDER) {
    if (THEMES[id].motsCles.some((kw) => t.includes(kw))) return THEMES[id];
  }
  return THEMES.generique;
}

function normaliserGenre(genre: string): GenreNom {
  return (GENRES_VALIDES.find((g) => g === genre) ?? "Fantasy") as GenreNom;
}

function normaliserDifficulte(d: string): Difficulte {
  return (DIFFICULTES_VALIDES.find((x) => x === d) ?? "normal") as Difficulte;
}

// Corrige les élisions issues de la substitution ({lieu}/{decor} commencent
// souvent par "le/les") : "de le" -> "du", "à les" -> "aux", "que une" -> "qu'une"...
function corrigerElisions(s: string): string {
  return s
    .replace(/\bjusqu'à le /g, "jusqu'au ")
    .replace(/\bjusqu'à les /g, "jusqu'aux ")
    .replace(/\bde le /g, "du ")
    .replace(/\bde les /g, "des ")
    .replace(/\bà le /g, "au ")
    .replace(/\bà les /g, "aux ")
    .replace(/\bque une /g, "qu'une ")
    .replace(/\bque un /g, "qu'un ");
}

function remplir(gabarit: string, ctx: Ctx): string {
  return corrigerElisions(
    gabarit
      .replace(/\{titre\}/g, ctx.titre)
      .replace(/\{lieuHabille\}/g, ctx.lieuHabille)
      .replace(/\{lieu\}/g, ctx.lieu)
      .replace(/\{decor\}/g, ctx.decor)
      .replace(/\{antagoniste\}/g, ctx.antagoniste),
  );
}

const PV_MAG_PAR_DIFFICULTE: Record<Difficulte, number> = {
  facile: 10, normal: 15, difficile: 20, legendaire: 25,
};
const STAT_MAG_PAR_DIFFICULTE: Record<Difficulte, number> = {
  facile: 1, normal: 1, difficile: 2, legendaire: 2,
};
const STAT_KEYS = ["force", "agility", "magie", "endurance"] as const;

function texteConsequence(genre: GenreData, difficulte: Difficulte, ctx: Ctx, texteIdx: number): string {
  return remplir(at(genre.consequences[difficulte], texteIdx), ctx);
}

function consequenceCombat(genre: GenreData, difficulte: Difficulte, ctx: Ctx, texteIdx: number): ConsequenceGeneree {
  const [min, max] = NIVEAUX_PAR_DIFFICULTE[difficulte];
  const level = randInt(min, Math.min(max, 12));
  return { type: "combat", level, text: texteConsequence(genre, difficulte, ctx, texteIdx) };
}

function consequenceEvenement(genre: GenreData, difficulte: Difficulte, ctx: Ctx, texteIdx: number): ConsequenceGeneree {
  const text = texteConsequence(genre, difficulte, ctx, texteIdx);
  const pvMag = PV_MAG_PAR_DIFFICULTE[difficulte];
  const statMag = STAT_MAG_PAR_DIFFICULTE[difficulte];
  const c: ConsequenceGeneree = { text };
  const r = Math.random();
  if (r < 0.30) c.pv = Math.round(pvMag * 0.7);
  else if (r < 0.62) c.pv = -pvMag;
  else if (r < 0.81) c[pick(STAT_KEYS)] = statMag;
  else c[pick(STAT_KEYS)] = -statMag;
  return c;
}

function consequenceSimple(genre: GenreData, difficulte: Difficulte, ctx: Ctx, texteIdx: number): ConsequenceGeneree {
  return { text: texteConsequence(genre, difficulte, ctx, texteIdx) };
}

export function composerAventure(input: CompositionInput): AventureGeneree {
  const genreNom = normaliserGenre(input.genre);
  const difficulte = normaliserDifficulte(input.difficulte);
  const genre = GENRES[genreNom];
  const theme = detecterTheme(input.titre);

  // Pools melanges une fois par aventure : evite les repetitions consecutives
  // et garantit qu'on parcourt toute la variete disponible avant de boucler.
  const scenesPool = shuffle(genre.scenes);
  const choixPool = shuffle(genre.choix);
  const ambiancePool = shuffle(genre.ambiances);
  const antagonistesPool = shuffle(genre.antagonistes);
  const decorsPool = shuffle(theme.decors);

  const lieu = pick(theme.lieux);
  const ctxBase: Ctx = {
    titre: input.titre.trim(),
    lieu,
    lieuHabille: lieu,
    decor: decorsPool[0],
    antagoniste: antagonistesPool[0],
  };
  const lieuHabille = remplir(pick(genre.habillagesLieu), ctxBase);
  ctxBase.lieuHabille = lieuHabille;

  // Titre enrichi si trop court
  const motsCount = ctxBase.titre.split(/\s+/).length;
  const titre = motsCount < 4 ? `${ctxBase.titre} - ${lieu}` : ctxBase.titre;
  ctxBase.titre = titre;

  // Description (ambiance dediee)
  const ambiance = remplir(at(ambiancePool, 0), ctxBase);
  const description = corrigerElisions(`${titre} - ${ambiance} Votre quête vous mène jusqu'à ${lieuHabille}. ${CLOTURE_DIFFICULTE[difficulte]}`);

  // Nombre de noeuds d'histoire, variable
  const [min, max] = TAILLE_PAR_DIFFICULTE[difficulte];
  const taille = randInt(min, max);

  const noeuds: NoeudGenere[] = [];

  for (let i = 0; i < taille; i++) {
    const id = i === 0 ? "debut" : `n${i}`;

    // Chaque noeud combine des elements differents (decor, antagoniste,
    // ambiance, scene, paire de choix) pris dans des pools melanges et
    // decales par des index distincts -> chaque noeud est unique.
    const ctx: Ctx = {
      ...ctxBase,
      decor: at(decorsPool, i),
      antagoniste: at(antagonistesPool, i + 1),
    };

    const ambianceNoeud = at(ambiancePool, i + 1);
    const scene = at(scenesPool, i);
    const texte = remplir(`${ambianceNoeud} ${scene}`, ctx);
    const paire = at(choixPool, i);

    const dernier = i === taille - 1;
    const cibleA = dernier ? "fin1" : `n${i + 1}`;
    const cibleB = dernier ? "fin2" : `n${i + 1}`;

    // Rythme modéré : 1 nœud/3 combat, 1/3 événement, reste narratif.
    const kind = dernier ? "plain" : i % 3 === 0 ? "combat" : i % 3 === 1 ? "event" : "plain";

    const consA: ConsequenceGeneree =
      kind === "combat"
        ? consequenceCombat(genre, difficulte, ctx, i)
        : consequenceSimple(genre, difficulte, ctx, i);
    const consB: ConsequenceGeneree =
      kind === "event"
        ? consequenceEvenement(genre, difficulte, ctx, i + 1)
        : consequenceSimple(genre, difficulte, ctx, i + 1);

    const choixA: ChoixGenere = { libelle: remplir(paire[0], ctx), cible: cibleA, consequence: consA };
    const choixB: ChoixGenere = { libelle: remplir(paire[1], ctx), cible: cibleB, consequence: consB };

    noeuds.push({ id, texte, fin: false, choix: [choixA, choixB] });
  }

  // Deux fins distinctes
  noeuds.push({
    id: "fin1",
    texte: remplir(at(FIN_TRIOMPHE, 0), { ...ctxBase, antagoniste: antagonistesPool[0] }),
    fin: true,
    choix: [],
  });
  noeuds.push({
    id: "fin2",
    texte: remplir(at(FIN_AMERE, 0), ctxBase),
    fin: true,
    choix: [],
  });

  const tags = pickN(genre.tags, 3) as [string, string, string];

  return {
    titre,
    description,
    lieu,
    genre: genreNom,
    difficulte,
    tags,
    noeuds,
  };
}
