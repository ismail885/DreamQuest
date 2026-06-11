import { BASE_MONSTERS } from "@/lib/monsters";
import { THEMES, THEME_ORDER } from "./themes";
import { GENRES } from "./genres";
import type {
  AventureGeneree,
  ChoixGenere,
  CompositionInput,
  Difficulte,
  EmbranchementGenere,
  EnemyType,
  GenreData,
  GenreNom,
  ThemeData,
} from "./types";

const GENRES_VALIDES: GenreNom[] = [
  "Science-Fiction", "Fantasy", "Horreur", "Policier", "Western",
  "Pirate", "Cyberpunk", "Mythologique", "Romance",
];

const DIFFICULTES_VALIDES: Difficulte[] = ["facile", "normal", "difficile", "legendaire"];

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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
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

function remplir(
  gabarit: string,
  ctx: { titre: string; lieu: string; lieuHabille: string; decor: string; antagoniste: string },
): string {
  return gabarit
    .replace(/\{titre\}/g, ctx.titre)
    .replace(/\{lieuHabille\}/g, ctx.lieuHabille)
    .replace(/\{lieu\}/g, ctx.lieu)
    .replace(/\{decor\}/g, ctx.decor)
    .replace(/\{antagoniste\}/g, ctx.antagoniste);
}

function choisirEnnemi(types: EnemyType[], difficulte: Difficulte): string | undefined {
  const [min, max] = NIVEAUX_PAR_DIFFICULTE[difficulte];
  const pool = BASE_MONSTERS.filter(
    (m) => types.includes(m.type) && m.level >= min && m.level <= max,
  );
  const fallback = BASE_MONSTERS.filter((m) => types.includes(m.type));
  const choix = pool.length > 0 ? pool : fallback;
  return choix.length > 0 ? pick(choix).id : undefined;
}

function construireDescription(
  titre: string,
  genre: GenreData,
  lieuHabille: string,
  difficulte: Difficulte,
  ctx: { titre: string; lieu: string; lieuHabille: string; decor: string; antagoniste: string },
): string {
  const ambiance = remplir(pick(genre.ambiances), ctx);
  return `${titre} — ${ambiance} Votre quête vous mène jusqu'à ${lieuHabille}. ${CLOTURE_DIFFICULTE[difficulte]}`;
}

function construireEmbranchement(
  id: 1 | 2 | 3,
  genre: GenreData,
  difficulte: Difficulte,
  ctx: { titre: string; lieu: string; lieuHabille: string; decor: string; antagoniste: string },
  avecCombat: boolean,
  avecEvenement: boolean,
): EmbranchementGenere {
  const texte = remplir(pick(genre.scenes), ctx);
  const paireChoix = pick(genre.choix);
  const consequences = pickN(genre.consequences[difficulte], 2);

  const choixA: ChoixGenere = {
    libelle: remplir(paireChoix[0], ctx),
    consequence: { texte: remplir(consequences[0] ?? genre.consequences[difficulte][0], ctx) },
  };
  const choixB: ChoixGenere = {
    libelle: remplir(paireChoix[1], ctx),
    consequence: { texte: remplir(consequences[1] ?? consequences[0] ?? genre.consequences[difficulte][0], ctx) },
  };

  if (avecCombat) {
    const enemyId = choisirEnnemi(genre.enemyTypes, difficulte);
    if (enemyId) choixA.consequence.combat = { enemyId };
  }
  if (avecEvenement) {
    choixB.consequence.evenement = { type: pick(genre.evenements) };
  }

  return { id, texte, choix: [choixA, choixB] };
}

export function composerAventure(input: CompositionInput): AventureGeneree {
  const genreNom = normaliserGenre(input.genre);
  const difficulte = normaliserDifficulte(input.difficulte);
  const genre = GENRES[genreNom];
  const theme = detecterTheme(input.titre);

  const lieu = pick(theme.lieux);
  const lieuHabille = remplir(pick(genre.habillagesLieu), {
    titre: input.titre, lieu, lieuHabille: lieu, decor: "", antagoniste: "",
  });
  const antagoniste = pick(genre.antagonistes);

  const titreInitial = input.titre.trim();
  const motsCount = titreInitial.split(/\s+/).length;
  const titre = motsCount < 4 ? `${titreInitial} — ${lieu}` : titreInitial;

  const ctxBase = { titre, lieu, lieuHabille, decor: "", antagoniste };
  const decors = pickN(theme.decors, 3);

  const embranchements = ([1, 2, 3] as const).map((id, i) =>
    construireEmbranchement(
      id,
      genre,
      difficulte,
      { ...ctxBase, decor: decors[i] ?? pick(theme.decors) },
      i !== 2,            // combats sur les 2 premiers embranchements
      i === 1 || i === 2, // événements spéciaux sur les 2 derniers
    ),
  ) as [EmbranchementGenere, EmbranchementGenere, EmbranchementGenere];

  const tags = pickN(genre.tags, 3) as [string, string, string];

  return {
    titre,
    description: construireDescription(titre, genre, lieuHabille, difficulte, {
      ...ctxBase, decor: pick(theme.decors),
    }),
    lieu,
    genre: genreNom,
    difficulte,
    tags,
    embranchements,
  };
}
