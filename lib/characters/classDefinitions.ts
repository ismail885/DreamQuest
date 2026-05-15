// ============================================================
// FICHIER CENTRALISÉ : Définitions des classes de personnages
// DreamQuest - RPG Textuel Interactif
// 
// Ce fichier est la source unique de vérité pour toutes les
// données liées aux classes de personnages.
// Importer via '@/lib/characters/classDefinitions' ou
// ré-exporter depuis '@/types' (backward compatible).
// ============================================================

import { 
  Swords, Sparkles, Wind, Skull, Shield, Cross, 
  Target, Leaf, User, Flame, Sword, Zap, Heart, LucideIcon 
} from 'lucide-react';

// ===== TYPES =====

export type CharacterClass = 
  | 'Guerrier' | 'Mage' | 'Assassin' | 'Prêtre' | 'Paladin' 
  | 'Archer' | 'Druide' | 'Nécromancien' | 'Voleur' | 'Barbare';

export type CharacterAbility = 
  | 'Rage' | 'Coup Puissant' | 'Défense de Fer'
  | 'Boule de Feu' | 'Éclair' | 'Bouclier Magique'
  | 'Invisibilité' | 'Attaque Sournoise' | 'Évasion'
  | 'Soin' | 'Protection Divine' | 'Résurrection' | 'Aura Sacrée'
  | 'Châtiment' | 'Bouclier de Foi'
  | 'Tir Perçant' | 'Pluie de Flèches' | "Vision d'Aigle"
  | 'Forme Animale' | 'Épines Venimeuses' | 'Régénération'
  | 'Drain de Vie' | 'Armée de Morts' | 'Malédiction'
  | 'Crochetage' | 'Pickpocket' | 'Évasion Rapide'
  | 'Rage Bestiale' | 'Coup Dévastateur' | 'Berserker'
  | 'Bouclier Sacré' | 'Faveur Divine' | 'Prière Guérisseuse' | 'Bénédiction'
  | 'Tir Précis' | 'Instinct de Chasseur'
  | 'Étreinte de la Nature'
  | 'Coup Silencieux' | 'Filouterie' | 'Fuite Agile'
  | 'Cri de Guerre' | 'Frappe Brutale' | 'Furie Bestiale';

/** Types de capacités pour catégorisation visuelle */
export type AbilityType = 'OFFENSIVE' | 'DEFENSIVE' | 'PASSIVE' | 'SUPPORT' | 'UTILITY';

/** Niveaux de difficulté pour chaque classe */
export type Difficulty = 'DEBUTANT' | 'INTERMEDIAIRE' | 'EXPERT';

// ===== INTERFACES =====

export interface CharacterStats {
  force: number;
  agility: number;
  magie: number;
  endurance: number;
}

export type StatKey = keyof CharacterStats;

/** Informations détaillées sur une capacité spéciale */
export interface AbilityInfo {
  name: CharacterAbility;
  description: string;
  type: AbilityType;
  cooldown?: number; // en tours, optionnel
}

/** Informations sur une classe de personnage */
export interface ClassInfo {
  name: CharacterClass;
  description: string;
  baseStats: CharacterStats;
  abilities: CharacterAbility[];
  image: string;
  role: string;
  playstyle: string;
  difficulty: Difficulty;
  difficultyOrder: number; // 1=Débutant, 2=Intermédiaire, 3=Expert
}

// ===== CONSTANTES =====

/** Icônes pour chaque classe */
export const CLASS_ICONS: Record<CharacterClass, LucideIcon> = {
  Guerrier: Swords,
  Mage: Sparkles,
  Assassin: Wind,
  Prêtre: Cross,
  Paladin: Shield,
  Archer: Target,
  Druide: Leaf,
  Nécromancien: Skull,
  Voleur: User,
  Barbare: Flame,
};

/** Icônes pour chaque statistique */
export const STAT_ICONS: Record<StatKey, LucideIcon> = {
  force: Sword,
  agility: Zap,
  magie: Sparkles,
  endurance: Heart,
};

/** Libellés français des statistiques */
export const STAT_LABELS: Record<StatKey, string> = {
  force: 'Force',
  agility: 'Agilité',
  magie: 'Magie',
  endurance: 'Endurance',
};

/** Couleurs associées à chaque statistique (classes Tailwind) */
export const STAT_COLORS: Record<StatKey, string> = {
  force: 'text-orange-400',
  agility: 'text-yellow-400',
  magie: 'text-purple-400',
  endurance: 'text-red-400',
};

/** Descriptions détaillées de toutes les capacités */
export const ABILITIES_DATA: Record<CharacterAbility, AbilityInfo> = {
  // === GUERRIER ===
  Rage: {
    name: 'Rage',
    description: 'Entre dans une furie guerrière, augmentant les dégâts de 30% pendant 3 tours.',
    type: 'OFFENSIVE',
    cooldown: 5,
  },
  'Coup Puissant': {
    name: 'Coup Puissant',
    description: 'Un coup dévastateur infligeant 200% de dégâts de force à un ennemi.',
    type: 'OFFENSIVE',
    cooldown: 3,
  },
  'Défense de Fer': {
    name: 'Défense de Fer',
    description: 'Renforce votre armure, réduisant les dégâts subis de 50% pendant 2 tours.',
    type: 'DEFENSIVE',
    cooldown: 4,
  },

  // === MAGE ===
  'Boule de Feu': {
    name: 'Boule de Feu',
    description: 'Projette une boule de feu infligeant 250% de dégâts de magie à tous les ennemis.',
    type: 'OFFENSIVE',
    cooldown: 3,
  },
  'Éclair': {
    name: 'Éclair',
    description: 'Invoque un éclair du ciel infligeant 180% de dégâts de magie et étourdissant 1 tour.',
    type: 'OFFENSIVE',
    cooldown: 4,
  },
  'Bouclier Magique': {
    name: 'Bouclier Magique',
    description: 'Crée un bouclier absorbant les dégâts magiques pendant 3 tours.',
    type: 'DEFENSIVE',
    cooldown: 5,
  },

  // === ASSASSIN ===
  'Invisibilité': {
    name: 'Invisibilité',
    description: 'Devient invisible, garantissant que votre prochaine attaque sera un critique.',
    type: 'UTILITY',
    cooldown: 4,
  },
  'Attaque Sournoise': {
    name: 'Attaque Sournoise',
    description: 'Une attaque furtive infligeant 300% de dégâts d\'agilité. Critique si invisible.',
    type: 'OFFENSIVE',
    cooldown: 3,
  },
  'Évasion': {
    name: 'Évasion',
    description: 'Esquive la prochaine attaque ennemie avec 90% de chance.',
    type: 'DEFENSIVE',
    cooldown: 3,
  },

  // === PRÊTRE ===
  'Soin': {
    name: 'Soin',
    description: 'Invoque la lumière pour restaurer 40% des PV maximum d\'un allié.',
    type: 'SUPPORT',
    cooldown: 3,
  },
  'Protection Divine': {
    name: 'Protection Divine',
    description: 'Bénit un allié, réduisant les dégâts qu\'il subit de 40% pendant 3 tours.',
    type: 'SUPPORT',
    cooldown: 4,
  },
  'Résurrection': {
    name: 'Résurrection',
    description: 'Ramène un allié à la vie avec 50% de ses PV maximum.',
    type: 'SUPPORT',
    cooldown: 8,
  },
  'Aura Sacrée': {
    name: 'Aura Sacrée',
    description: 'Émet une aura lumineuse qui soigne tous les alliés de 15% chaque tour.',
    type: 'SUPPORT',
    cooldown: 6,
  },
  'Prière Guérisseuse': {
    name: 'Prière Guérisseuse',
    description: 'Une prière puissante qui restaure 60% des PV de tous les alliés.',
    type: 'SUPPORT',
    cooldown: 5,
  },
  'Bénédiction': {
    name: 'Bénédiction',
    description: 'Bénit le groupe, augmentant toutes les statistiques de 15% pour 3 tours.',
    type: 'SUPPORT',
    cooldown: 5,
  },

  // === PALADIN ===
  'Châtiment': {
    name: 'Châtiment',
    description: 'Invoque la lumière sacrée pour infliger 150% de dégâts et soigner l\'utilisateur de 20%.',
    type: 'OFFENSIVE',
    cooldown: 4,
  },
  'Bouclier de Foi': {
    name: 'Bouclier de Foi',
    description: 'Un bouclier sacré qui absorbe les dégâts et soigne de 10% par tour.',
    type: 'DEFENSIVE',
    cooldown: 4,
  },
  'Bouclier Sacré': {
    name: 'Bouclier Sacré',
    description: 'Invoque un bouclier divin réduisant tous les dégâts de 60% pendant 2 tours.',
    type: 'DEFENSIVE',
    cooldown: 5,
  },
  'Faveur Divine': {
    name: 'Faveur Divine',
    description: 'Invoque une faveur divine augmentant la force et l\'endurance de 25% pour 3 tours.',
    type: 'SUPPORT',
    cooldown: 5,
  },

  // === ARCHER ===
  'Tir Perçant': {
    name: 'Tir Perçant',
    description: 'Une flèche qui traverse les défenses, infligeant 220% de dégâts d\'agilité.',
    type: 'OFFENSIVE',
    cooldown: 3,
  },
  'Pluie de Flèches': {
    name: 'Pluie de Flèches',
    description: 'Déchaîne une pluie de flèches infligeant 150% de dégâts à tous les ennemis.',
    type: 'OFFENSIVE',
    cooldown: 4,
  },
  "Vision d'Aigle": {
    name: "Vision d'Aigle",
    description: 'Aiguise votre vision, augmentant la précision et les chances de critique de 30%.',
    type: 'PASSIVE',
    cooldown: 0,
  },
  'Tir Précis': {
    name: 'Tir Précis',
    description: 'Un tir parfaitement ajusté infligeant 280% de dégâts d\'agilité. Critique garanti.',
    type: 'OFFENSIVE',
    cooldown: 4,
  },
  'Instinct de Chasseur': {
    name: 'Instinct de Chasseur',
    description: 'Repère les faiblesses de l\'ennemi, augmentant les dégâts critiques de 40%.',
    type: 'PASSIVE',
    cooldown: 0,
  },

  // === DRUIDE ===
  'Forme Animale': {
    name: 'Forme Animale',
    description: 'Se transforme en ours puissant, augmentant force et endurance de 40% pendant 4 tours.',
    type: 'OFFENSIVE',
    cooldown: 6,
  },
  'Épines Venimeuses': {
    name: 'Épines Venimeuses',
    description: 'Invoque des épines qui empoisonnent l\'ennemi, infligeant 20% de dégâts par tour.',
    type: 'OFFENSIVE',
    cooldown: 3,
  },
  'Régénération': {
    name: 'Régénération',
    description: 'Canalise l\'énergie de la nature pour restaurer 25% de vos PV chaque tour.',
    type: 'SUPPORT',
    cooldown: 4,
  },
  'Étreinte de la Nature': {
    name: 'Étreinte de la Nature',
    description: 'Les racines de la nature immobilisent un ennemi pendant 2 tours.',
    type: 'UTILITY',
    cooldown: 4,
  },

  // === NÉCROMANCIEN ===
  'Drain de Vie': {
    name: 'Drain de Vie',
    description: 'Aspire la force vitale d\'un ennemi, infligeant 120% de dégâts et vous soignant de 50%.',
    type: 'OFFENSIVE',
    cooldown: 3,
  },
  'Armée de Morts': {
    name: 'Armée de Morts',
    description: 'Invoque des sbires squelettiques qui attaquent vos ennemis pendant 3 tours.',
    type: 'OFFENSIVE',
    cooldown: 6,
  },
  'Malédiction': {
    name: 'Malédiction',
    description: 'Maudit un ennemi, réduisant ses statistiques de 25% pendant 4 tours.',
    type: 'UTILITY',
    cooldown: 4,
  },

  // === VOLEUR ===
  'Crochetage': {
    name: 'Crochetage',
    description: 'Ouvre les serrures verrouillées avec une grande discrétion.',
    type: 'UTILITY',
    cooldown: 0,
  },
  'Pickpocket': {
    name: 'Pickpocket',
    description: 'Dérobe l\'argent d\'un ennemi sans qu\'il s\'en aperçoive.',
    type: 'UTILITY',
    cooldown: 2,
  },
  'Évasion Rapide': {
    name: 'Évasion Rapide',
    description: 'Vous téléporte derrière les lignes ennemies, et esquive toute attaque ce tour.',
    type: 'DEFENSIVE',
    cooldown: 4,
  },
  'Coup Silencieux': {
    name: 'Coup Silencieux',
    description: 'Un coup rapide et silencieux infligeant 200% de dégâts. Ne révèle pas votre position.',
    type: 'OFFENSIVE',
    cooldown: 2,
  },
  'Filouterie': {
    name: 'Filouterie',
    description: 'Détecte et désarme les pièges avec une grande efficacité.',
    type: 'UTILITY',
    cooldown: 0,
  },
  'Fuite Agile': {
    name: 'Fuite Agile',
    description: 'Tente de fuir le combat avec 85% de chance de succès.',
    type: 'UTILITY',
    cooldown: 5,
  },

  // === BARBARE ===
  'Rage Bestiale': {
    name: 'Rage Bestiale',
    description: 'Invoque la fureur primitive, augmentant les dégâts de 50% mais réduisant la défense de 20%.',
    type: 'OFFENSIVE',
    cooldown: 5,
  },
  'Coup Dévastateur': {
    name: 'Coup Dévastateur',
    description: 'Un coup d\'une puissance inouïe infligeant 350% de dégâts de force.',
    type: 'OFFENSIVE',
    cooldown: 4,
  },
  'Berserker': {
    name: 'Berserker',
    description: 'Entre en transe berserker : plus vos PV sont bas, plus vos dégâts augmentent.',
    type: 'PASSIVE',
    cooldown: 0,
  },
  'Cri de Guerre': {
    name: 'Cri de Guerre',
    description: 'Un cri terrifiant qui réduit la défense de tous les ennemis de 30% pour 3 tours.',
    type: 'UTILITY',
    cooldown: 4,
  },
  'Frappe Brutale': {
    name: 'Frappe Brutale',
    description: 'Une frappe brute infligeant 250% de dégâts avec 30% de chance d\'étourdir.',
    type: 'OFFENSIVE',
    cooldown: 3,
  },
  'Furie Bestiale': {
    name: 'Furie Bestiale',
    description: 'Une rafale d\'attaques infligeant 4 coups à 60% de dégâts chacun.',
    type: 'OFFENSIVE',
    cooldown: 5,
  },
};

/** Niveau de difficulté de chaque classe (1 = Débutant, 3 = Expert) */
export const CLASS_DIFFICULTIES: Record<CharacterClass, { level: Difficulty; order: number; reason: string }> = {
  Guerrier: { level: 'DEBUTANT', order: 1, reason: 'Mécaniques simples, combat direct' },
  Mage: { level: 'INTERMEDIAIRE', order: 2, reason: 'Gestion de mana et placement requis' },
  Assassin: { level: 'EXPERT', order: 3, reason: 'Positionnement critique et timing parfait' },
  Prêtre: { level: 'INTERMEDIAIRE', order: 2, reason: 'Gestion des priorités de soin' },
  Paladin: { level: 'DEBUTANT', order: 1, reason: 'Polyvalent et robuste, facile à prendre en main' },
  Archer: { level: 'DEBUTANT', order: 1, reason: 'Combat à distance simple et efficace' },
  Druide: { level: 'EXPERT', order: 3, reason: 'Polyvalence complexe entre soins et dégâts' },
  Nécromancien: { level: 'EXPERT', order: 3, reason: 'Gestion d\'invocations et ressources multiples' },
  Voleur: { level: 'INTERMEDIAIRE', order: 2, reason: 'Fragile mais puissant, placement crucial' },
  Barbare: { level: 'DEBUTANT', order: 1, reason: 'Tout en offensive, mécaniques directes' },
};

// ===== DÉFINITIONS COMPLÈTES DES 10 CLASSES =====

export const CHARACTER_CLASSES: Record<CharacterClass, ClassInfo> = {
  Guerrier: {
    name: 'Guerrier',
    description: 'Maître du combat rapproché, force et endurance exceptionnelles. Sa puissance physique écrase ses adversaires.',
    baseStats: { force: 8, agility: 5, magie: 3, endurance: 7 },
    abilities: ['Rage', 'Coup Puissant', 'Défense de Fer'],
    image: '/illustrations_personnage/guerrier.jpg',
    role: 'Combattant',
    playstyle: 'Combat rapproché offensif',
    difficulty: 'DEBUTANT',
    difficultyOrder: 1,
  },
  Mage: {
    name: 'Mage',
    description: 'Manipulateur de magie élémentaire, intelligence supérieure. Ses sorts détruisent ses ennemis à distance.',
    baseStats: { force: 3, agility: 4, magie: 9, endurance: 4 },
    abilities: ['Boule de Feu', 'Éclair', 'Bouclier Magique'],
    image: '/illustrations_personnage/mage.jpg',
    role: 'Mage',
    playstyle: 'Magie offensive à distance',
    difficulty: 'INTERMEDIAIRE',
    difficultyOrder: 2,
  },
  Assassin: {
    name: 'Assassin',
    description: 'Expert en furtivité et attaques rapides. Il frappe dans l\'ombre avant de disparaître.',
    baseStats: { force: 5, agility: 9, magie: 4, endurance: 5 },
    abilities: ['Invisibilité', 'Attaque Sournoise', 'Évasion'],
    image: '/illustrations_personnage/assassin.jpg',
    role: 'Assassin',
    playstyle: 'Furtivité et critique',
    difficulty: 'EXPERT',
    difficultyOrder: 3,
  },
  Nécromancien: {
    name: 'Nécromancien',
    description: 'Maître des ténèbres et des âmes perdues. Il contrôle les morts pour combattre à ses côtés.',
    baseStats: { force: 2, agility: 4, magie: 9, endurance: 3 },
    abilities: ['Drain de Vie', 'Armée de Morts', 'Malédiction'],
    image: '/illustrations_personnage/necromancien.jpg',
    role: 'Invocateur',
    playstyle: 'Magie sombre et invocation',
    difficulty: 'EXPERT',
    difficultyOrder: 3,
  },
  Paladin: {
    name: 'Paladin',
    description: 'Chevalier sacré engagé dans la quête de la justice. Protecteur né, il protège ses alliés avec une foi inébranlable.',
    baseStats: { force: 7, agility: 4, magie: 5, endurance: 8 },
    abilities: ['Bouclier Sacré', 'Faveur Divine', 'Châtiment'],
    image: '/illustrations_personnage/paladin.jpeg',
    role: 'Protecteur',
    playstyle: 'Combat rapproché defensif',
    difficulty: 'DEBUTANT',
    difficultyOrder: 1,
  },
  Prêtre: {
    name: 'Prêtre',
    description: 'Serviteur de la lumière, guide spirituel et guérisseur. Ses prières thérapeut les blessures de l\'âme et du corps.',
    baseStats: { force: 4, agility: 4, magie: 7, endurance: 6 },
    abilities: ['Prière Guérisseuse', 'Bénédiction', 'Bouclier Sacré'],
    image: '/illustrations_personnage/prêtre.jpeg',
    role: 'Soutien',
    playstyle: 'Soins et buffs',
    difficulty: 'INTERMEDIAIRE',
    difficultyOrder: 2,
  },
  Archer: {
    name: 'Archer',
    description: 'Maître de l\'arc, il frappe ses ennemis de loin avec une précision mortelle.',
    baseStats: { force: 4, agility: 9, magie: 5, endurance: 4 },
    abilities: ['Tir Précis', 'Pluie de Flèches', 'Instinct de Chasseur'],
    image: '/illustrations_personnage/archer.jpeg',
    role: 'Attaquant Distance',
    playstyle: 'Attaques à distance',
    difficulty: 'DEBUTANT',
    difficultyOrder: 1,
  },
  Druide: {
    name: 'Druide',
    description: 'Gardien de la nature, il canalise le pouvoir des éléments. Polyvalent, il peut soigner ou attaquer.',
    baseStats: { force: 5, agility: 6, magie: 7, endurance: 6 },
    abilities: ['Forme Animale', 'Étreinte de la Nature', 'Régénération'],
    image: '/illustrations_personnage/druide.jpeg',
    role: 'Hybride',
    playstyle: 'Polyvalent magie et combat',
    difficulty: 'EXPERT',
    difficultyOrder: 3,
  },
  Voleur: {
    name: 'Voleur',
    description: 'Expert en discrétion et manipulation. Il frappe dans l\'ombre avant que l\'ennemi ne réagisse.',
    baseStats: { force: 4, agility: 10, magie: 5, endurance: 4 },
    abilities: ['Coup Silencieux', 'Filouterie', 'Fuite Agile'],
    image: '/illustrations_personnage/voleur.jpeg',
    role: 'Assassin',
    playstyle: 'Furtivité et Critique',
    difficulty: 'INTERMEDIAIRE',
    difficultyOrder: 2,
  },
  Barbare: {
    name: 'Barbare',
    description: 'Guerrier barbare maîtrisant la rage primitive. Sa force brute intimide ses adversaires.',
    baseStats: { force: 10, agility: 6, magie: 2, endurance: 8 },
    abilities: ['Cri de Guerre', 'Frappe Brutale', 'Furie Bestiale'],
    image: '/illustrations_personnage/barbare.jpeg',
    role: 'Berserker',
    playstyle: 'Combat offensif agressif',
    difficulty: 'DEBUTANT',
    difficultyOrder: 1,
  },
};

/** Compétences passives par classe */
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

// ===== FONCTIONS UTILITAIRES =====

/** Calcul de l'XP nécessaire pour atteindre un niveau */
export const calculateRequiredXP = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

/** XP totale cumulée pour un niveau donné */
export const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateRequiredXP(i);
  }
  return total;
};

/** Récupérer les infos détaillées des capacités d'une classe */
export const getClassAbilitiesWithInfo = (className: CharacterClass): AbilityInfo[] => {
  const classInfo = CHARACTER_CLASSES[className];
  if (!classInfo) return [];
  return classInfo.abilities
    .map(abilityName => ABILITIES_DATA[abilityName])
    .filter((info): info is AbilityInfo => info !== undefined);
};

/** Récupérer les stats formatées pour affichage */
export const getFormattedStats = (stats: CharacterStats): Array<{ key: StatKey; label: string; value: number; icon: LucideIcon; color: string }> => {
  return (Object.keys(stats) as StatKey[]).map(key => ({
    key,
    label: STAT_LABELS[key],
    value: stats[key],
    icon: STAT_ICONS[key],
    color: STAT_COLORS[key],
  }));
};

/** Valider un nom de personnage */
export const validateCharacterName = (name: string): { valid: boolean; error?: string } => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Le nom du personnage est requis' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Le nom doit contenir au moins 3 caractères' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Le nom ne peut pas dépasser 20 caractères' };
  }
  if (!/^[a-zA-ZÀ-ÿæÆœŒ '-]+$/.test(trimmed)) {
    return { valid: false, error: 'Le nom ne peut contenir que des lettres, tirets et apostrophes' };
  }
  return { valid: true };
};

/** Libellé français de la difficulté */
export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string; level: number }> = {
  DEBUTANT: { label: 'Débutant', color: 'text-green-400', level: 1 },
  INTERMEDIAIRE: { label: 'Intermédiaire', color: 'text-yellow-400', level: 2 },
  EXPERT: { label: 'Expert', color: 'text-red-400', level: 3 },
};
