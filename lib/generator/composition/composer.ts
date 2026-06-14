import { BASE_MONSTERS } from "@/lib/monsters";
import { THEMES, THEME_ORDER } from "./themes";
import { GENRES } from "./genres";
import type {
  AventureGeneree,
  ChoixGenere,
  CompositionInput,
  ConsequenceGeneree,
  Difficulte,
  EnemyType,
  GenreData,
  GenreNom,
  NoeudGenere,
  ThemeData,
} from "./types";

const GENRES_VALIDES: GenreNom[] = [
  "Science-Fiction", "Fantasy", "Horreur", "Policier", "Western",
  "Pirate", "Cyberpunk", "Mythologique", "Romance",
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
  facile: "Une chance reelle s'offre a l'aventurier courageux.",
  normal: "Seul un guerrier experimente en sortira indemne.",
  difficile: "Il faudra un heros chevronne pour survivre a cette epreuve.",
  legendaire: "Seule une ame prete au sacrifice peut esperer en revenir.",
};

const FIN_TRIOMPHE = [
  "Contre toute attente, vous triomphez. Le souvenir de {lieu} vous suivra comme une legende.",
  "L'epreuve s'acheve sur une victoire cherement acquise. {antagoniste} ne menacera plus personne.",
];
const FIN_AMERE = [
  "Vous survivez, mais marque a jamais. Certaines histoires ne se terminent pas comme on l'espere.",
  "Le destin en a decide autrement : vous quittez {lieu} en laissant une part de vous derriere.",
];

interface Ctx {
  titre: string;
  lieu: string;
  lieuHabille: string;
  decor: string;
  antagoniste: string;
}

function pick<T>(arr: T[]): T {
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

function remplir(gabarit: string, ctx: Ctx): string {
  return gabarit
    .replace(/\{titre\}/g, ctx.titre)
    .replace(/\{lieuHabille\}/g, ctx.lieuHabille)
    .replace(/\{lieu\}/g, ctx.lieu)
    .replace(/\{decor\}/g, ctx.decor)
    .replace(/\{antagoniste\}/g, ctx.antagoniste);
}

function choisirEnnemi(types: EnemyType[], difficulte: Difficulte): string | undefined {
  const [min, max] = NIVEAUX_PAR_DIFFICULTE[difficulte];
  const pool = BASE_MONSTERS.filter((m) => types.includes(m.type) && m.level >= min && m.level <= max);
  const fallback = BASE_MONSTERS.filter((m) => types.includes(m.type));
  const choix = pool.length > 0 ? pool : fallback;
  return choix.length > 0 ? pick(choix).id : undefined;
}

function consequence(
  genre: GenreData,
  difficulte: Difficulte,
  ctx: Ctx,
  texteIdx: number,
  avecCombat: boolean,
  avecEvenement: boolean,
): ConsequenceGeneree {
  const pool = genre.consequences[difficulte];
  const c: ConsequenceGeneree = { texte: remplir(at(pool, texteIdx), ctx) };
  if (avecCombat) {
    const enemyId = choisirEnnemi(genre.enemyTypes, difficulte);
    if (enemyId) c.combat = { enemyId };
  }
  if (avecEvenement) {
    c.evenement = { type: pick(genre.evenements) };
  }
  return c;
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
  const evenementsPool = shuffle(genre.evenements);

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
  const description = `${titre} - ${ambiance} Votre quete vous mene jusqu'a ${lieuHabille}. ${CLOTURE_DIFFICULTE[difficulte]}`;

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

    // Combats / evenements repartis de facon variee sur le parcours
    const avecCombat = !dernier && i % 2 === 0;
    const avecEvenement = i % 2 === 1;

    const choixA: ChoixGenere = {
      libelle: remplir(paire[0], ctx),
      cible: cibleA,
      consequence: consequence(genre, difficulte, ctx, i, avecCombat, false),
    };
    const choixB: ChoixGenere = {
      libelle: remplir(paire[1], ctx),
      cible: cibleB,
      consequence: consequence(genre, difficulte, ctx, i + 1, false, avecEvenement),
    };
    if (choixB.consequence.evenement) {
      choixB.consequence.evenement = { type: at(evenementsPool, i) };
    }

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
