export type CharacterClass = 'Guerrier' | 'Mage' | 'Assassin' | 'Prêtre' | 'Paladin' | 'Archer' | 'Druide' | 'Nécromancien' | 'Voleur' | 'Barbare';

export type CharacterAbility = 
  | 'Rage' 
  | 'Coup Puissant' 
  | 'Défense de Fer' 
  | 'Boule de Feu' 
  | 'Éclair'
  | 'Bouclier Magique'
  | 'Soin' 
  | 'Invisibilité'
  | 'Attaque Sournoise'
  | 'Évasion'
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
  | 'Berserker';

export interface CharacterStats {
  force: number;
  agilite: number;
  intelligence: number;
  endurance: number;
}

export interface ClassInfo {
  name: CharacterClass;
  description: string;
  baseStats: CharacterStats;
  abilities: CharacterAbility[];
  image: string;
}

export interface Character {
  id_personnage?: number;
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
    description: 'Maître du combat rapproché, force et endurance exceptionnelles',
    baseStats: {
      force: 8,
      agilite: 5,
      intelligence: 3,
      endurance: 7
    },
    abilities: ['Rage', 'Coup Puissant', 'Défense de Fer'],
    image: '/illustrations_personnage/paladin.jpeg'
  },
  Mage: {
    name: 'Mage',
    description: 'Manipulateur de magie élémentaire, intelligence supérieure',
    baseStats: {
      force: 3,
      agilite: 4,
      intelligence: 9,
      endurance: 4
    },
    abilities: ['Boule de Feu', 'Éclair', 'Bouclier Magique'],
    image: '/illustrations_personnage/prêtre.jpeg'
  },
  Assassin: {
    name: 'Assassin',
    description: 'Expert en furtivité et attaques rapides',
    baseStats: {
      force: 5,
      agilite: 9,
      intelligence: 4,
      endurance: 5
    },
    abilities: ['Invisibilité', 'Attaque Sournoise', 'Évasion'],
    image: '/illustrations_personnage/paladin.jpeg'
  },
  Prêtre: {
    name: 'Prêtre',
    description: 'Guérisseur et protecteur, équilibre entre force et magie',
    baseStats: {
      force: 4,
      agilite: 4,
      intelligence: 7,
      endurance: 6
    },
    abilities: ['Soin', 'Protection Divine', 'Résurrection'],
    image: '/illustrations_personnage/pretre.jpeg'
  },
  Paladin: {
    name: 'Paladin',
    description: 'Chevalier sacré, défenseur de la justice et de la lumière',
    baseStats: {
      force: 7,
      agilite: 4,
      intelligence: 5,
      endurance: 8
    },
    abilities: ['Aura Sacrée', 'Châtiment', 'Bouclier de Foi'],
    image: '/illustrations_personnage/paladin.jpeg'
  },
  Archer: {
    name: 'Archer',
    description: 'Tireur d\'élite, précision mortelle à distance',
    baseStats: {
      force: 4,
      agilite: 9,
      intelligence: 5,
      endurance: 4
    },
    abilities: ['Tir Perçant', 'Pluie de Flèches', 'Vision d\'Aigle'],
    image: '/illustrations_personnage/archer.jpeg'
  },
  Druide: {
    name: 'Druide',
    description: 'Gardien de la nature, maître des métamorphoses',
    baseStats: {
      force: 5,
      agilite: 6,
      intelligence: 7,
      endurance: 6
    },
    abilities: ['Forme Animale', 'Épines Venimeuses', 'Régénération'],
    image: '/illustrations_personnage/druide.jpeg'
  },
  Nécromancien: {
    name: 'Nécromancien',
    description: 'Maître des ténèbres et des âmes perdues',
    baseStats: {
      force: 2,
      agilite: 4,
      intelligence: 9,
      endurance: 3
    },
    abilities: ['Drain de Vie', 'Armée de Morts', 'Malédiction'],
    image: '/illustrations_personnage/necromancien.jpeg'
  },
  Voleur: {
    name: 'Voleur',
    description: 'Spécialiste du vol et de la discrétion',
    baseStats: {
      force: 4,
      agilite: 10,
      intelligence: 5,
      endurance: 4
    },
    abilities: ['Crochetage', 'Pickpocket', 'Évasion Rapide'],
    image: '/illustrations_personnage/voleur.jpeg'
  },
  Barbare: {
    name: 'Barbare',
    description: 'Guerrier sauvage, force brute et rage incontrôlable',
    baseStats: {
      force: 10,
      agilite: 6,
      intelligence: 2,
      endurance: 8
    },
    abilities: ['Rage Bestiale', 'Coup Dévastateur', 'Berserker'],
    image: '/illustrations_personnage/barbare.jpeg'
  }
};

export const STAT_LABELS: Record<keyof CharacterStats, string> = {
  force: 'Force',
  agilite: 'Agilité',
  intelligence: 'Intelligence',
  endurance: 'Endurance'
};

export const STAT_ICONS: Record<keyof CharacterStats, string> = {
  force: '💪',
  agilite: '⚡',
  intelligence: '🧠',
  endurance: '❤️'
};
