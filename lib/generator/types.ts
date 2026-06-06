export interface GeneratedChoice {
  link?: string;
  text: string;
  consequences: string;
}

export interface GeneratedNode {
  id: string;
  text: string;
  choices: GeneratedChoice[];
  isEnd?: boolean;
}

export interface GenreContent {
  plotHooks: string[];
  locations: { name: string; description: string }[];
  npcs: { name: string; role: string; description: string }[];
  earlyEvents: { text: string; consequence: string }[];
  midEvents: { text: string; consequence: string }[];
  climaxEvents: { text: string; consequence: string }[];
  twists: string[];
  endings: { text: string; condition: string }[];
  choiceSets: string[][];
  artifacts: { name: string; description: string }[];
  monsters: string[];
}

export interface GeneratorInput {
  title: string;
  genre: string;
  description?: string;
  longueur?: "court" | "normal" | "long";
}

export interface GeneratedAdventure {
  nodes: GeneratedNode[];
  description: string;
  difficulty: "easy" | "normal" | "hard";
  duree_estimee: number;
}
