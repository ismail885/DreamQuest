// API DE GENERATION ALEATOIRE POUR DREAMQUEST

import { CharacterClass, CharacterStats } from '@/types';

export const ABILITIES_POOL: Record<CharacterClass, string[]> = {
  Guerrier: [
    'Rage', 'Coup Puissant', 'Defense de Fer', 'Cri de Guerre', 
    'Coup de Bouclier', 'Force du Taureau', 'Frappe Brutale',
    'Posture Definitive', 'Charge Heroique', 'Eventration'
  ],
  Mage: [
    'Boule de Feu', 'Eclair', 'Bouclier Magique', 'Teleportation',
    'Nova de Feu', 'Glacement', 'Ecole des Arcanes',
    'Domination Mentale', 'Invocation de Familier', 'Mur de Force'
  ],
  Assassin: [
    'Invisibilite', 'Attaque Sournoise', 'Evasion', 'Poison',
    'Assassinat', 'Lame Empoisonnee', 'Pas de lOmbre',
    'Tueur Silencieux', 'Coup Critique', 'Fuite Tactique'
  ],
  Prêtre: [
    'Soin', 'Protection Divine', 'Resurrection', 'Benediction',
    'Lumiere Sainte', 'Guerison de Masse', 'Bouclier de Foi',
    'Exorcisme', 'Priere de Misericorde', 'Rayon de Soleil'
  ],
  Paladin: [
    'Aura Sacree', 'Chatiment', 'Bouclier de Foi', 'Juge',
    'Marteau du Justice', 'Lumiere du Aube', 'Protection Stellaire',
    'Bannissement', 'Croisade', 'Foi Inebranlable'
  ],
  Archer: [
    'Tir Perçant', 'Pluie de Fleches', 'Vision dAigle', 'Tir Rapide',
    'Fleche Explosive', 'Piège', 'Camouflage',
    'Tir a lAveugle', 'Tempete de Fleches', 'Chasseur Expert'
  ],
  Druide: [
    'Forme Animale', 'Epines Venimeuses', 'Regeneration', 'Croissance',
    'Pack du Loup', 'Griffes du Tigre', 'Ecorce',
    'Photosynthese', 'Appel de la Foret', 'Metamorphose'
  ],
  Nécromancien: [
    'Drain de Vie', 'Armee de Morts', 'Maledition', 'Terreur',
    'Sceau des Ombres', 'Resurrection Noir', 'Corruption',
    'Voile de la Mort', 'Ame Parchee', 'Invocation de Squelette'
  ],
  Voleur: [
    'Crochetage', 'Pickpocket', 'Evasion Rapide', 'Main Leste',
    'Fausse Identite', 'Sournoiserie', 'Vol a la tire',
    'Camouflage Urbain', 'Dextelite', 'Fuite Express'
  ],
  Barbare: [
    'Rage Bestiale', 'Coup Devastateur', 'Berserker', 'Hurlement',
    'Frenesie', 'Pulverisation', 'Peau de Pierre',
    'Bond Sauvage', 'Destruction', 'Furie Indomptable'
  ]
};

// Bonus de stats par niveau
export const LEVEL_BONUS: Record<number, Partial<CharacterStats>> = {
  2: { endurance: 1 },
  3: { force: 1 },
  4: { agility: 1 },
  5: { intelligence: 1 },
  6: { endurance: 2 },
  7: { force: 2 },
  8: { agility: 2 },
  9: { intelligence: 2 },
  10: { endurance: 3 }
};

// Evenements aleatoires dans les aventures
export const RANDOM_EVENTS = [
  {
    id: 'rencontre',
    text: 'Vous rencontrez un voyageur solitaire qui vous demande de aide.',
    choices: [
      { text: 'Lui parler', consequence: { xp: 20, pv: 0, stat: null } },
      { text: 'Lignorer', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Lattaquer', consequence: { xp: 10, pv: -15, stat: 'force' } }
    ]
  },
  {
    id: 'tresor',
    text: 'Vous trouvez un coffre ancien!',
    choices: [
      { text: 'Louvrir prudemment', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Le forcer', consequence: { xp: 5, pv: -5, stat: 'force' } },
      { text: 'Lignorer', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'piege',
    text: 'Vous tombez dans un piege!',
    choices: [
      { text: 'Esquiver', consequence: { xp: 10, pv: -10, stat: 'agility' } },
      { text: 'Briser les chaines', consequence: { xp: 20, pv: -20, stat: 'force' } },
      { text: 'Appeler a laide', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'magic',
    text: 'Une source de magie scintille devant vous.',
    choices: [
      { text: 'Boire', consequence: { xp: 25, pv: 20, stat: 'intelligence' } },
      { text: 'Collecter', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Ne pas y toucher', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'bestiole',
    text: 'Une creature mysterieuse apparait!',
    choices: [
      { text: 'Combattre', consequence: { xp: 30, pv: -15, stat: 'force' } },
      { text: 'Fuir', consequence: { xp: 5, pv: 0, stat: 'agility' } },
      { text: 'Parler', consequence: { xp: 20, pv: 0, stat: 'intelligence' } }
    ]
  }
];

// Fonction principale de generation aleatoire
export function generateRandomStats(classe: CharacterClass): CharacterStats {
  const classInfo = {
    Guerrier: { force: 8, agility: 5, intelligence: 3, endurance: 7 },
    Mage: { force: 3, agility: 4, intelligence: 9, endurance: 4 },
    Assassin: { force: 5, agility: 9, intelligence: 4, endurance: 5 },
    Prêtre: { force: 4, agility: 4, intelligence: 7, endurance: 6 },
    Paladin: { force: 7, agility: 4, intelligence: 5, endurance: 8 },
    Archer: { force: 4, agility: 9, intelligence: 5, endurance: 4 },
    Druide: { force: 5, agility: 6, intelligence: 7, endurance: 6 },
    Nécromancien: { force: 2, agility: 4, intelligence: 9, endurance: 3 },
    Voleur: { force: 4, agility: 10, intelligence: 5, endurance: 4 },
    Barbare: { force: 10, agility: 6, intelligence: 2, endurance: 8 }
  };

  const base = classInfo[classe];
  const variation = {
    force: Math.floor(Math.random() * 3) - 1,
    agility: Math.floor(Math.random() * 3) - 1,
    intelligence: Math.floor(Math.random() * 3) - 1,
    endurance: Math.floor(Math.random() * 3) - 1
  };

  return {
    force: Math.max(1, base.force + variation.force),
    agility: Math.max(1, base.agility + variation.agility),
    intelligence: Math.max(1, base.intelligence + variation.intelligence),
    endurance: Math.max(1, base.endurance + variation.endurance)
  };
}

export function getRandomAbility(classe: CharacterClass, ownedAbilities: string[] = []): string {
  const pool = ABILITIES_POOL[classe] || [];
  const available = pool.filter(a => !ownedAbilities.includes(a));
  
  if (available.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

export function getAbilitiesForLevel(classe: CharacterClass, niveau: number, ownedAbilities: string[] = []): string[] {
  const abilities: string[] = [];
  
  if (niveau >= 4) {
    abilities.push(getRandomAbility(classe, abilities));
  }
  
  if (niveau >= 7) {
    abilities.push(getRandomAbility(classe, abilities));
  }
  
  if (niveau >= 10) {
    abilities.push(getRandomAbility(classe, abilities));
  }
  
  return abilities;
}

export function calculateXPForLevel(niveau: number): number {
  if (niveau <= 1) return 0;
  
  let xp = 0;
  for (let i = 2; i <= niveau; i++) {
    xp += (i - 1) * 100;
  }
  return xp;
}

export function getLevelFromXP(xp: number): number {
  let niveau = 1;
  let xpRequis = 0;
  
  while (xp >= xpRequis + niveau * 100) {
    niveau++;
    xpRequis += (niveau - 1) * 100;
  }
  
  return niveau;
}

export function getRandomEvent(): typeof RANDOM_EVENTS[0] {
  return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
}
