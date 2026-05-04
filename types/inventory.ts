export type ItemRarity = 'commun' | 'rare' | 'épique' | 'légendaire';
export type ItemType = 'arme' | 'armure' | 'potion' | 'clé' | 'ressource';
export type ItemSlot = 'main_droite' | 'main_gauche' | 'tête' | 'corps' | 'accessoire';

export interface ItemStats {
  force?: number;
  agility?: number;
  intelligence?: number;
  endurance?: number;
  pv?: number;
}

export interface GameItem {
  id: number;
  nom: string;
  description: string;
  type: ItemType;
  rareté: ItemRarity;
  slot?: ItemSlot;
  stats: ItemStats;
  icon: string; // Nom de l'icône Lucide
  image: string;
  valeur: number; // prix en or
}

// Inventaire d'un personnage
export interface InventoryItem {
  id: number;
  id_personnage: number;
  id_objet: number;
  quantite: number;
  est_équipé: boolean;
  date_obtention: string;

  // Joined data
  objet?: GameItem;
}

// Inventaire complet
export interface Inventory {
  items: InventoryItem[];
  capacité: number;
  or: number;
}

// Objets par défaut disponibles dans le jeu
export const DEFAULT_ITEMS: Record<string, GameItem> = {
  // Armes
  épée_bois: {
    id: 1,
    nom: 'Épée en Bois',
    description: 'Une épée de训练 básica.',
    type: 'arme',
    rareté: 'commun',
    slot: 'main_droite',
    stats: { force: 1 },
    icon: 'Sword',
    image: '/items/épée_bois.png',
    valeur: 10,
  },
  épée_fer: {
    id: 2,
    nom: 'Épée de Fer',
    description: 'Une épée forgée dans le fer, fiable et solide.',
    type: 'arme',
    rareté: 'commun',
    slot: 'main_droite',
    stats: { force: 3 },
    icon: 'Sword',
    image: '/items/épée_fer.png',
    valeur: 50,
  },
  épée_feu: {
    id: 3,
    nom: 'Épée Enflammée',
    description: 'Une épée magique dont la lame est enveloppée de flammes.',
    type: 'arme',
    rareté: 'rare',
    slot: 'main_droite',
    stats: { force: 5, intelligence: 2 },
    icon: 'Flame',
    image: '/items/épée_feu.png',
    valeur: 200,
  },
  arc_simple: {
    id: 4,
    nom: 'Arc Simple',
    description: 'Un arc de chasse basic.',
    type: 'arme',
    rareté: 'commun',
    slot: 'main_droite',
    stats: { agility: 2 },
    icon: 'Target',
    image: '/items/arc.png',
    valeur: 30,
  },
  baguette_magique: {
    id: 5,
    nom: 'Baguette Magique',
    description: 'Une baguette artisanale channels la magie.',
    type: 'arme',
    rareté: 'commun',
    slot: 'main_droite',
    stats: { intelligence: 3 },
    icon: 'Wand',
    image: '/items/baguette.png',
    valeur: 45,
  },

  // Armures
  cuir_léger: {
    id: 6,
    nom: 'Armure de Cuir Légère',
    description: 'Une armure basique en cuir.',
    type: 'armure',
    rareté: 'commun',
    slot: 'corps',
    stats: { endurance: 1 },
    icon: 'Shield',
    image: '/items/cuir.png',
    valeur: 25,
  },
  bouclier_bois: {
    id: 7,
    nom: 'Bouclier en Bois',
    description: 'Un bouclier basique offre une protection légère.',
    type: 'armure',
    rareté: 'commun',
    slot: 'main_gauche',
    stats: { endurance: 1 },
    icon: 'Shield',
    image: '/items/bouclier.png',
    valeur: 20,
  },

  // Potions
  potion_soin: {
    id: 8,
    nom: 'Potion de Soin',
    description: 'Restaure 30 points de vie.',
    type: 'potion',
    rareté: 'commun',
    stats: { pv: 30 },
    icon: 'Heart',
    image: '/items/potion_soin.png',
    valeur: 15,
  },
  potion_force: {
    id: 9,
    nom: 'Potion de Force',
    description: 'Augmente la force de 2 pendant 5 minutes.',
    type: 'potion',
    rareté: 'rare',
    stats: { force: 2 },
    icon: 'Zap',
    image: '/items/potion_force.png',
    valeur: 50,
  },
  potion_agilité: {
    id: 10,
    nom: 'Potion d\'Agilité',
    description: 'Augmente l\'agilité de 2 pendant 5 minutes.',
    type: 'potion',
    rareté: 'rare',
    stats: { agility: 2 },
    icon: 'Wind',
    image: '/items/potion_agilité.png',
    valeur: 50,
  },

  // Clés
  clé_château: {
    id: 11,
    nom: 'Clé du Château',
    description: 'Une clé ouvrant les portes du château.',
    type: 'clé',
    rareté: 'rare',
    stats: {},
    icon: 'Key',
    image: '/items/clé.png',
    valeur: 100,
  },
  clé_cave: {
    id: 12,
    nom: 'Clé de la Cave',
    description: 'Accède aux caves sombres.',
    type: 'clé',
    rareté: 'rare',
    stats: {},
    icon: 'Key',
    image: '/items/clé.png',
    valeur: 80,
  },

  // Ressources
  or_x10: {
    id: 13,
    nom: '10 Pièces d\'Or',
    description: 'De la monnaie sonnante et trébuchante.',
    type: 'ressource',
    rareté: 'commun',
    stats: {},
    icon: 'Coins',
    image: '/items/or.png',
    valeur: 10,
  },
  gemme_rouge: {
    id: 14,
    nom: 'Gemme Rouge',
    description: 'Une gemme précieuse de couleur rubis.',
    type: 'ressource',
    rareté: 'rare',
    stats: {},
    icon: 'Gem',
    image: '/items/gemme.png',
    valeur: 150,
  },
};

// Fonction utilitaire pour créer un item à partir de la clé
export function getItemById(id: number): GameItem | undefined {
  return Object.values(DEFAULT_ITEMS).find(item => item.id === id);
}

export function getItemByKey(key: string): GameItem | undefined {
  return DEFAULT_ITEMS[key];
}

// Couleurs pour la rareté
export const RARITY_COLORS: Record<ItemRarity, string> = {
  commun: '#9ca3af',      // gray-400
  rare: '#3b82f6',       // blue-500
  épique: '#a855f7',     // purple-500
  légendaire: '#eab308', // yellow-500
};

// Icônes pour les types d'items (noms des composants Lucide)
export const ITEM_TYPE_ICONS: Record<ItemType, string> = {
  arme: 'Sword',
  armure: 'Shield',
  potion: 'FlaskConical',
  clé: 'Key',
  ressource: 'Gem',
};