import type { ThemeData, ThemeId } from "./types";

export const THEMES: Record<ThemeId, ThemeData> = {
  chateau: {
    id: "chateau",
    motsCles: [
      "chateau", "donjon", "tour", "forteresse", "rempart",
      "manoir", "citadelle", "bastille", "palais", "castel",
    ],
    lieux: [
      "la Citadelle de Vorn",
      "le Donjon de Maleterre",
      "la Tour Veyne",
      "le Palais des Brumes",
      "la Forteresse d'Aldrenn",
    ],
    decors: [
      "les remparts effondrés",
      "la salle du trône déserte",
      "l'escalier en colimaçon",
      "la herse rouillée",
      "les souterrains voûtés",
    ],
  },

  foret: {
    id: "foret",
    motsCles: [
      "foret", "bois", "arbres", "clairiere", "sylve",
      "sous-bois", "lisiere", "bosquet", "taillis",
    ],
    lieux: [
      "la Sylve de Brûlemousse",
      "la Clairière des Murmures",
      "le Bois de Trenne",
      "les Taillis d'Ombrefeuille",
      "la Lisière de Vaubois",
    ],
    decors: [
      "les racines noueuses",
      "la canopée impénétrable",
      "le ruisseau noir",
      "les fougères hautes",
      "la souche creuse",
    ],
  },

  catacombe: {
    id: "catacombe",
    motsCles: [
      "catacombe", "crypte", "tombe", "tombeau", "cimetiere",
      "mausolee", "ossuaire", "souterrain", "necropole",
    ],
    lieux: [
      "les Catacombes de Sombreroche",
      "la Crypte des Oubliés",
      "la Nécropole de Valmorts",
      "le Mausolée de Cendres",
      "l'Ossuaire de Dorne",
    ],
    decors: [
      "les niches funéraires",
      "l'escalier descendant",
      "les sarcophages éventrés",
      "le couloir d'ossements",
      "la dalle scellée",
    ],
  },

  marais: {
    id: "marais",
    motsCles: [
      "marais", "marecage", "tourbe", "tourbieres", "brume",
      "vase", "fange", "bourbier", "etang",
    ],
    lieux: [
      "le Marais de Fangenoire",
      "les Tourbières de Lugne",
      "l'Étang des Noyés",
      "le Bourbier de Sangsue",
      "la Fange de Vermorne",
    ],
    decors: [
      "les nappes de brume",
      "les troncs immergés",
      "la passerelle pourrie",
      "les feux follets",
      "la vase mouvante",
    ],
  },

  mer: {
    id: "mer",
    motsCles: [
      "mer", "ocean", "ile", "bateau", "navire",
      "abysses", "port", "cote", "recif", "phare", "galion",
    ],
    lieux: [
      "l'Île de Sombrecrête",
      "le Phare de Brisecap",
      "le Récif des Naufrageurs",
      "le Port de Lamenoire",
      "les Abysses de Vahl",
    ],
    decors: [
      "le pont battu par les vagues",
      "la grève de galets",
      "la grotte marine",
      "le ressac écumant",
      "la coque échouée",
    ],
  },

  montagne: {
    id: "montagne",
    motsCles: [
      "montagne", "pic", "sommet", "gouffre", "caverne",
      "mine", "glacier", "col", "falaise", "grotte",
    ],
    lieux: [
      "le Pic de Crochefer",
      "les Mines de Grommepierre",
      "le Gouffre de Vertèbre",
      "le Col des Vents Hurleurs",
      "la Caverne d'Échomorne",
    ],
    decors: [
      "la corniche vertigineuse",
      "le boyau étroit",
      "le pont de pierre suspendu",
      "le filon scintillant",
      "l'éboulis instable",
    ],
  },

  ville: {
    id: "ville",
    motsCles: [
      "ville", "cite", "village", "taverne", "guilde",
      "marche", "quartier", "ruelle", "eglise", "place",
    ],
    lieux: [
      "la Cité de Pierregrise",
      "le Quartier des Lanternes",
      "la Taverne du Corbeau",
      "les Ruelles de Bas-Fond",
      "la Place du Vieux Marché",
    ],
    decors: [
      "les ruelles tortueuses",
      "la halle du marché",
      "le clocher fissuré",
      "l'arrière-cour close",
      "les toits en surplomb",
    ],
  },

  temple: {
    id: "temple",
    motsCles: [
      "temple", "sanctuaire", "autel", "culte", "rituel",
      "prophetie", "idole", "relique", "monastere", "prieure",
    ],
    lieux: [
      "le Sanctuaire d'Aubeterne",
      "le Temple aux Mille Voix",
      "le Monastère de Solpart",
      "l'Autel de Cendrelune",
      "le Prieuré des Silences",
    ],
    decors: [
      "la nef obscure",
      "l'autel de marbre noir",
      "les statues encapuchonnées",
      "le bénitier tari",
      "la crypte sous le chœur",
    ],
  },

  desertique: {
    id: "desertique",
    motsCles: [
      "desert", "sable", "oasis", "dunes", "ruines",
      "pyramide", "sphinx", "steppes",
    ],
    lieux: [
      "les Dunes de Khar",
      "l'Oasis de Mirelune",
      "la Pyramide de Sethomet",
      "les Ruines de Zafharah",
      "les Steppes de Brûlesable",
    ],
    decors: [
      "la mer de sable",
      "la colonnade ensevelie",
      "le puits asséché",
      "la tempête de sable",
      "l'ombre d'un sphinx brisé",
    ],
  },

  glace: {
    id: "glace",
    motsCles: [
      "glace", "neige", "blizzard", "toundra", "givre",
      "froid", "banquise", "congele", "verglas",
    ],
    lieux: [
      "la Toundra de Givrelan",
      "la Banquise de Norhelm",
      "le Col de Blancfroid",
      "les Cavernes de Verglas",
      "le Plateau de Brisegel",
    ],
    decors: [
      "la congère profonde",
      "le lac gelé",
      "la grotte de glace bleue",
      "le vent de blizzard",
      "la crevasse béante",
    ],
  },

  generique: {
    id: "generique",
    motsCles: [],
    lieux: [
      "les Terres de Nahl",
      "le Carrefour des Errants",
      "le Domaine d'Olmar",
      "la Marche de Vendel",
      "le Seuil de Karne",
    ],
    decors: [
      "le sentier oublié",
      "la clairière silencieuse",
      "le vieux pont de pierre",
      "la ruine sans nom",
      "l'horizon incertain",
    ],
  },
};

/** Ordre de priorité de détection (le générique est le fallback). */
export const THEME_ORDER: ThemeId[] = [
  "chateau", "foret", "catacombe", "marais", "mer",
  "montagne", "ville", "temple", "desertique", "glace",
];
