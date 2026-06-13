// Moteur de composition theme x genre x difficulte (aucune IA, aucun appel externe).
// Le theme (detecte dans le titre) fournit le decor, le genre la tonalite,
// la difficulte regle la severite des consequences et la longueur de l'histoire.

export type Difficulte = "facile" | "normal" | "difficile" | "legendaire";

export type GenreNom =
  | "Science-Fiction"
  | "Fantasy"
  | "Horreur"
  | "Policier"
  | "Western"
  | "Pirate"
  | "Cyberpunk"
  | "Mythologique"
  | "Romance";

export type ThemeId =
  | "chateau"
  | "foret"
  | "catacombe"
  | "marais"
  | "mer"
  | "montagne"
  | "ville"
  | "temple"
  | "desertique"
  | "glace"
  | "generique";

export type EnemyType = "beast" | "undead" | "demon" | "human" | "elemental";

export interface ThemeData {
  id: ThemeId;
  motsCles: string[];
  lieux: string[];
  decors: string[];
}

// Placeholders acceptes dans les gabarits : {titre} {lieu} {lieuHabille} {decor} {antagoniste}
export interface GenreData {
  nom: GenreNom;
  habillagesLieu: string[];
  antagonistes: string[];
  ambiances: string[];
  scenes: string[];
  choix: [string, string][];
  consequences: Record<Difficulte, string[]>;
  tags: string[];
  enemyTypes: EnemyType[];
  evenements: string[];
}

// Format compatible avec les colonnes JSONB existantes (choix1/2_consequences).
export interface ConsequenceGeneree {
  texte: string;
  combat?: { enemyId: string };
  evenement?: { type: string };
}

export interface ChoixGenere {
  libelle: string;
  // Id du noeud cible (ex: "n2", "fin1"). Vide pour un noeud final.
  cible: string;
  consequence: ConsequenceGeneree;
}

export interface NoeudGenere {
  id: string; // "debut", "n1", "n2", ..., "fin1", "fin2"
  texte: string;
  fin: boolean;
  choix: ChoixGenere[]; // 2 choix, ou 0 si fin
}

export interface AventureGeneree {
  titre: string;
  description: string;
  lieu: string;
  genre: GenreNom;
  difficulte: Difficulte;
  tags: [string, string, string];
  noeuds: NoeudGenere[];
}

export interface CompositionInput {
  titre: string;
  genre: GenreNom;
  difficulte: Difficulte;
}
