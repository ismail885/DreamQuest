const ADVENTURE_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=500&fit=crop",
  2: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=500&fit=crop",
  3: "https://images.unsplash.com/photo-1589308078059-be1415eab064?w=1200&h=500&fit=crop",
  4: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&h=500&fit=crop",
  5: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=500&fit=crop",
  6: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&h=500&fit=crop",
};

export function getAdventureImage(adventureId: number): string {
  return ADVENTURE_IMAGES[adventureId] ?? ADVENTURE_IMAGES[1];
}

// Genre canonique (les alias BDD, anciens comme nouveaux, pointent vers
// les memes mots-cles). DA 100% heroic-fantasy.
const CANONICAL_GENRE: Record<string, string> = {
  fantasy: "fantasy",
  fantaisy: "fantasy",
  "dark-fantasy": "dark-fantasy",
  horreur: "dark-fantasy",
  horror: "dark-fantasy",
  mythologique: "mythologique",
  flibuste: "flibuste",
  pirate: "flibuste",
  intrigue: "intrigue",
  policier: "intrigue",
  mystere: "intrigue",
  "marches-sauvages": "marches-sauvages",
  western: "marches-sauvages",
  "conte-feerique": "conte-feerique",
  romance: "conte-feerique",
  "epopee-guerriere": "epopee-guerriere",
  cyberpunk: "epopee-guerriere",
  "arcane-reliques": "arcane-reliques",
  "science-fiction": "arcane-reliques",
  scifi: "arcane-reliques",
};

// Mots-cles par genre pour LoremFlickr (gratuit, sans cle, par mot-cle).
const GENRE_KEYWORDS: Record<string, string> = {
  fantasy: "fantasy,castle",
  "dark-fantasy": "dark,gothic,crypt",
  mythologique: "mythology,temple",
  flibuste: "pirate,ship",
  intrigue: "medieval,castle,throne",
  "marches-sauvages": "wilderness,outpost,frontier",
  "conte-feerique": "fairytale,enchanted,forest",
  "epopee-guerriere": "medieval,battle,knight",
  "arcane-reliques": "magic,artifact,ruins",
};

const DEFAULT_CANON = "fantasy";

// Mettre NEXT_PUBLIC_USE_LOCAL_IMAGES=true pour servir /public/genres/<genre>.jpg.
const USE_LOCAL = process.env.NEXT_PUBLIC_USE_LOCAL_IMAGES === "true";

export function canonicalGenre(genre?: string | null): string {
  return CANONICAL_GENRE[(genre ?? "").toLowerCase()] ?? DEFAULT_CANON;
}

/**
 * Image thematique par genre via LoremFlickr (gratuit, sans cle, par mot-cle).
 * - Mode local (NEXT_PUBLIC_USE_LOCAL_IMAGES=true) : /genres/<genre>.jpg
 * - Sinon : LoremFlickr. lock = id pour une image stable par aventure.
 */
export function getGenreImage(
  genre?: string | null,
  seed = 1,
  width = 600,
  height = 300,
): string {
  const canon = canonicalGenre(genre);
  if (USE_LOCAL) {
    return `/genres/${canon}.jpg`;
  }
  const keywords = GENRE_KEYWORDS[canon] ?? GENRE_KEYWORDS[DEFAULT_CANON];
  return `https://loremflickr.com/${width}/${height}/${keywords}?lock=${seed}`;
}

/** Image de secours instantanee : degrade SVG inline (data-URI), aucun reseau requis. */
export function getFallbackImage(seed: number, width = 600, height = 300): string {
  const h1 = (seed * 47) % 360;
  const h2 = (h1 + 40) % 360;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='hsl(${h1},55%,22%)'/>` +
    `<stop offset='1' stop-color='hsl(${h2},60%,12%)'/>` +
    `</linearGradient></defs>` +
    `<rect width='100%' height='100%' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
