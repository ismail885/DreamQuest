import { Zap, Sparkles, Heart, Sword, LucideIcon, Shield, Cross, Target, Leaf, User, Flame, Zap as Magia, Swords, Skull, Wind } from 'lucide-react';

export type CharacterClass = 'Guerrier' | 'Mage' | 'Assassin' | 'Prêtre' | 'Paladin' | 'Archer' | 'Druide' | 'Nécromancien' | 'Voleur' | 'Barbare';

// Icônes pour chaque classe
export const CLASS_ICONS: Record<CharacterClass, LucideIcon> = {
  Guerrier: Swords,
  Mage: Magia,
  Assassin: Wind,
  Prêtre: Cross,
  Paladin: Shield,
  Archer: Target,
  Druide: Leaf,
  Nécromancien: Skull,
  Voleur: User,
  Barbare: Flame,
};

export type CharacterAbility = 
  | 'Rage'
  | 'Coup Puissant'
  | 'Défense de Fer'
  | 'Boule de Feu'
  | 'Éclair'
  | 'Bouclier Magique'
  | 'Invisibilité'
  | 'Attaque Sournoise'
  | 'Évasion'
  | 'Soin'
  | 'Protection Divine'
  | 'Résurrection'
  | 'Aura Sacrée'
  | 'Châtiment'
  | 'Bouclier de Foi'
  | 'Tir Perçant'
  | 'Pluie de Flèches'
  | 'Vision d\'Aigle'
  | 'Forme Animale'
  | 'Épines Venimeuses'
  | 'Régénération'
  | 'Drain de Vie'
  | 'Armée de Morts'
  | 'Malédiction'
  | 'Crochetage'
  | 'Pickpocket'
  | 'Évasion Rapide'
  | 'Rage Bestiale'
  | 'Coup Dévastateur'
  | 'Berserker'
  | 'Bouclier Sacré'
  | 'Faveur Divine'
  | 'Prière Guérisseuse'
  | 'Bénédiction'
  | 'Tir Précis'
  | 'Instinct de Chasseur'
  | 'Étreinte de la Nature'
  | 'Coup Silencieux'
  | 'Filouterie'
  | 'Fuite Agile'
  | 'Cri de Guerre'
  | 'Frappe Brutale'
  | 'Furie Bestiale';

export interface CharacterStats {
  force: number;
  agility: number;
  magie: number;
  endurance: number;
}

export interface ClassInfo {
  name: CharacterClass;
  description: string;
  baseStats: CharacterStats;
  abilities: CharacterAbility[];
  image: string;
  role: string;
  playstyle: string;
}

export interface Character {
  id?: number;
  nom_personnage: string;
  classe: CharacterClass;
  niveau: number;
  points_vie: number;
  points_vie_max: number;
  stats: CharacterStats;
  id_utilisateur: number;
  date_creation?: string;
  experience?: number;
}

export interface CreateCharacterPayload {
  nom_personnage: string;
  classe: CharacterClass;
  id_utilisateur: number;
}

export const CHARACTER_CLASSES: Record<CharacterClass, ClassInfo> = {
  Guerrier: {
    name: 'Guerrier',
    description: 'Maître du combat rapproché, force et endurance exceptionnelles. Sa puissance physique écrase ses adversaires.',
    baseStats: {
      force: 8,
      agility: 5,
      magie: 3,
      endurance: 7
    },
    abilities: ['Rage', 'Coup Puissant', 'Défense de Fer'],
    image: '/illustrations_personnage/guerrier.jpg',
    role: 'Combattant',
    playstyle: 'Combat rapproché offensif'
  },
  Mage: {
    name: 'Mage',
    description: 'Manipulateur de magie élémentaire, intelligence supérieure. Ses sorts détruisent ses ennemis à distance.',
    baseStats: {
      force: 3,
      agility: 4,
      magie: 9,
      endurance: 4
    },
    abilities: ['Boule de Feu', 'Éclair', 'Bouclier Magique'],
    image: '/illustrations_personnage/mage.jpg',
    role: 'Mage',
    playstyle: 'Magie offensive à distance'
  },
  Assassin: {
    name: 'Assassin',
    description: 'Expert en furtivité et attaques rapides. Il frappe dans l\'ombre avant de disparaître.',
    baseStats: {
      force: 5,
      agility: 9,
      magie: 4,
      endurance: 5
    },
    abilities: ['Invisibilité', 'Attaque Sournoise', 'Évasion'],
    image: '/illustrations_personnage/assassin.jpg',
    role: 'Assassin',
    playstyle: 'Furtivité et critique'
  },
Nécromancien: {
    name: 'Nécromancien',
    description: 'Maître des ténèbres et des âmes perdues. Il contrôle les morts pour combattre à ses côtés.',
    baseStats: {
      force: 2,
      agility: 4,
      magie: 9,
      endurance: 3
    },
    abilities: ['Drain de Vie', 'Armée de Morts', 'Malédiction'],
    image: '/illustrations_personnage/necromancien.jpg',
    role: 'Invocateur',
    playstyle: 'Magie sombre et invocation'
  },
  Paladin: {
    name: 'Paladin',
    description: 'Chevalier sacré engagé dans la quête de la justice. Protecteur né, il protège ses alliés avec une foi inébranlable.',
    baseStats: {
      force: 7,
      agility: 4,
      magie: 5,
      endurance: 8
    },
    abilities: ['Bouclier Sacré', 'Faveur Divine', 'Châtiment'],
    image: '/illustrations_personnage/paladin.jpeg',
    role: 'Protecteur',
    playstyle: 'Combat rapproché defensif'
  },
  Prêtre: {
    name: 'Prêtre',
    description: 'Serviteur de la lumière, guide spirituel et guérisseur. Ses prières thérapeut les blessures de l\'âme et du corps.',
    baseStats: {
      force: 4,
      agility: 4,
      magie: 7,
      endurance: 6
    },
    abilities: ['Prière Guérisseuse', 'Bénédiction', 'Bouclier Sacré'],
    image: '/illustrations_personnage/prêtre.jpeg',
    role: 'Soutien',
    playstyle: 'Soins et buffs'
  },
  Archer: {
    name: 'Archer',
    description: 'Maître de l\'arc, il frappe ses ennemis de loin avec une précision mortelle. L\'étendue est son meilleur allié.',
    baseStats: {
      force: 4,
      agility: 9,
      magie: 5,
      endurance: 4
    },
    abilities: ['Tir Précis', 'Pluie de Flèches', 'Instinct de Chasseur'],
    image: '/illustrations_personnage/archer.jpeg',
    role: 'Attaquant Distance',
    playstyle: 'Attaques à distance'
  },
  Druide: {
    name: 'Druide',
    description: 'Gardien de la nature, il canalise le pouvoir des éléments. Polyvalent, il peut soignier ou attaquer selon la situation.',
    baseStats: {
      force: 5,
      agility: 6,
      magie: 7,
      endurance: 6
    },
    abilities: ['Forme Animale', 'Étreinte de la Nature', 'Régénération'],
    image: '/illustrations_personnage/druide.jpeg',
    role: 'Hybride',
    playstyle: 'Polyvalent magie et combat'
  },
  Voleur: {
    name: 'Voleur',
    description: 'Expert en discrétion et manipulation. Il frappe dans l\'ombre et s\'évade avant que l\'ennemi ne réagisse.',
    baseStats: {
      force: 4,
      agility: 10,
      magie: 5,
      endurance: 4
    },
    abilities: ['Coup Silencieux', 'Filouterie', 'Fuite Agile'],
    image: '/illustrations_personnage/voleur.jpeg',
    role: 'Assassin',
    playstyle: 'Furtivité et Critique'
  },
  Barbare: {
    name: 'Barbare',
    description: 'Guerrier barbare, maîtrisant la rage primitive. Sa force brute intimidation ses adversaires et raz tout sur son passage.',
    baseStats: {
      force: 10,
      agility: 6,
      magie: 2,
      endurance: 8
    },
    abilities: ['Cri de Guerre', 'Frappe Brutale', 'Furie Bestiale'],
    image: '/illustrations_personnage/barbare.jpeg',
    role: 'Berserker',
    playstyle: 'Combat offensif agressif'
  }
};

// French labels for stats
export const STAT_LABELS: Record<keyof CharacterStats, string> = {
  force: 'Force',
  agility: 'Agilité',
  magie: 'Magie',
  endurance: 'Endurance'
};

// French key names
export type StatKey = keyof CharacterStats;

export const STAT_ICONS: Record<StatKey, LucideIcon> = {
  force: Sword,
  agility: Zap,
  magie: Sparkles,
  endurance: Heart
};

// Compétences passives par classe
export const CLASS_PASSIVES: Record<CharacterClass, { name: string; description: string }> = {
  Guerrier: { name: "Force du Combattant", description: "+10% dégâts physiques" },
  Mage: { name: "Arcane Résistant", description: "+10% résistance magique" },
  Assassin: { name: "Coup Fatal", description: "+15% chance de critique" },
  Prêtre: { name: "Foi Guérisseuse", description: "+5% soins reçus" },
  Paladin: { name: "Bouclier Sacré", description: "+5% points de vie max" },
  Archer: { name: "Œil de Lynx", description: "+10% précision" },
  Druide: { name: "Force de la Nature", description: "+10% régénération" },
  Nécromancien: { name: "Lien Sombre", description: "+5% vol de vie" },
  Voleur: { name: "Ombre Fugitive", description: "+10% esquive" },
  Barbare: { name: "Furie Sauvage", description: "+10% force brute" },
};

// Calcul de l'XP nécessaire pour un niveau
export const calculateRequiredXP = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

//XP totale pour un niveau donné
export const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateRequiredXP(i);
  }
  return total;
};

