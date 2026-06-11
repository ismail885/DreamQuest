// Moteur de composition thème × genre × difficulté (aucune IA, aucun appel externe).
// Le thème (détecté dans le titre) fournit le décor, le genre la tonalité,
// la difficulté règle la sévérité des conséquences.

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

// Placeholders acceptés dans les gabarits : {titre} {lieu} {lieuHabille} {decor} {antagoniste}
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
  consequence: ConsequenceGeneree;
}

export interface EmbranchementGenere {
  id: 1 | 2 | 3;
  texte: string;
  choix: [ChoixGenere, ChoixGenere];
}

export interface AventureGeneree {
  titre: string;
  description: string;
  lieu: string;
  genre: GenreNom;
  difficulte: Difficulte;
  tags: [string, string, string];
  embranchements: [EmbranchementGenere, EmbranchementGenere, EmbranchementGenere];
}

export interface CompositionInput {
  titre: string;
  genre: GenreNom;
  difficulte: Difficulte;
}
