// API DE GENERATION ALEATOIRE POUR DREAMQUEST

import { CharacterClass, CharacterStats } from '@/types';

export const ABILITIES_POOL: Record<CharacterClass, string[]> = {
  Guerrier: [
    'Rage', 'Coup Puissant', 'Défense de Fer', 'Cri de Guerre',
    'Coup de Bouclier', 'Force du Taureau', 'Frappe Brutale',
    'Posture Définitif', 'Charge Héroïque', 'Éventration'
  ],
  Mage: [
    'Boule de Feu', 'Éclair', 'Bouclier Magique', 'Téléportation',
    'Nova de Feu', 'Glacement', 'École des Arcanes',
    'Domination Mentale', 'Invocation de Familier', 'Mur de Force'
  ],
  Assassin: [
    'Invisibilité', 'Attaque Sournoise', 'Évasion', 'Poison',
    'Assassinat', 'Lame Empoisonnée', 'Pas de l\'Ombre',
    'Tueur Silencieux', 'Coup Critique', 'Fuite Tactique'
  ],
  Nécromancien: [
    'Drain de Vie', 'Armée de Morts', 'Malédiction', 'Terreur',
    'Sceau des Ombres', 'Résurrection Noir', 'Corruption',
    'Voile de la Mort', 'Âme Parchée', 'Invocation de Squelette'
  ],
  Paladin: [
    'Bouclier Sacré', 'Faveur Divine', 'Châtiment', 'Jugement',
    'Marteau de Justice', 'Aube Lumineuse', 'Protection Stellaire',
    'Bannissement', 'Croisade', 'Foi Inébranlable'
  ],
  Prêtre: [
    'Prière Guérisseuse', 'Bénédiction', 'Lumière Sainte', 'Guérison de Masse',
    'Bouclier de Foi', 'Exorcisme', 'Prière de Miséricorde',
    'Rayon de Soleil', 'Résurrection', 'Don de Vie'
  ],
  Archer: [
    'Tir Précis', 'Pluie de Flèches', 'Instinct de Chasseur', 'Tir en Arc',
    'Flèche Empoisonnée', 'Tir Rapide', 'Vision d\'Aigle',
    'Chasseur Expérimenté', 'Tir Coulissant', 'Coup de Précision'
  ],
  Druide: [
    'Forme Animale', 'Étreinte de la Nature', 'Régénération', 'Métamorphose',
    'Tempête de Feu', 'Croissance Accélérée', 'Lien Spirituel',
    'Sérénité du Forêt', 'Puissance Primordiale', 'Guérison Totale'
  ],
  Voleur: [
    'Coup Silencieux', 'Filouterie', 'Fuite Agile', 'Ombre Fugitive',
    'Lame Empoisonnée', 'Pas de l\'Ombre', 'Tueur Silencieux',
    'Coup Critique', 'Fuite Tactique', 'Attaque Sournoise'
  ],
  Barbare: [
    'Cri de Guerre', 'Frappe Brutale', 'Furie Bestiale', 'Charge Sauvage',
    'Force du Taureau', 'Furie Incontrôlable', 'Écraseur',
    'Massacre', 'Tempête de Coups', 'Éventration'
  ]
};

// Bonus de stats par niveau
export const LEVEL_BONUS: Record<number, Partial<CharacterStats>> = {
  2: { endurance: 1 },
  3: { force: 1 },
  4: { agility: 1 },
  5: { magie: 1 },
  6: { endurance: 2 },
  7: { force: 2 },
  8: { agility: 2 },
  9: { magie: 2 },
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
      { text: 'Boire', consequence: { xp: 25, pv: 20, stat: 'magie' } },
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
      { text: 'Parler', consequence: { xp: 20, pv: 0, stat: 'magie' } }
    ]
  }
];

// Fonction principale de generation aleatoire
export function generateRandomStats(classe: CharacterClass): CharacterStats {
  const classInfo = {
    Guerrier: { force: 8, agility: 5, magie: 3, endurance: 7 },
    Mage: { force: 3, agility: 4, magie: 9, endurance: 4 },
    Assassin: { force: 5, agility: 9, magie: 4, endurance: 5 },
    Prêtre: { force: 4, agility: 4, magie: 7, endurance: 6 },
    Paladin: { force: 7, agility: 4, magie: 5, endurance: 8 },
    Archer: { force: 4, agility: 9, magie: 5, endurance: 4 },
    Druide: { force: 5, agility: 6, magie: 7, endurance: 6 },
    Nécromancien: { force: 2, agility: 4, magie: 9, endurance: 3 },
    Voleur: { force: 4, agility: 10, magie: 5, endurance: 4 },
    Barbare: { force: 10, agility: 6, magie: 2, endurance: 8 }
  };

  const base = classInfo[classe];
  const variation = {
    force: Math.floor(Math.random() * 3) - 1,
    agility: Math.floor(Math.random() * 3) - 1,
    magie: Math.floor(Math.random() * 3) - 1,
    endurance: Math.floor(Math.random() * 3) - 1
  };

  return {
    force: Math.max(1, base.force + variation.force),
    agility: Math.max(1, base.agility + variation.agility),
    magie: Math.max(1, base.magie + variation.magie),
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAbilitiesForLevel(classe: CharacterClass, niveau: number, _ownedAbilities: string[] = []): string[] {
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
