// Types pour les événements aléatoires
export type EventType = 'choice' | 'combat';

export interface RandomEventChoice {
  text: string;
  consequence: {
    xp?: number;
    pv?: number;
    stat?: string | null;
  };
}

export interface RandomEvent {
  id: string;
  type: EventType;
  text: string;
  monsterId?: string; // ID du monstre si type === 'combat'
  monsterName?: string; // Nom du monstre (pour les combats procéduraux)
  choices: RandomEventChoice[];
}

// Événements narratifs (sans combat)
export const NARRATIVE_EVENTS: RandomEvent[] = [
  {
    id: 'rencontre',
    type: 'choice',
    text: 'Vous rencontrez un voyageur solitaire qui vous demande de l\'aide.',
    choices: [
      { text: 'Lui parler', consequence: { xp: 20, pv: 0, stat: null } },
      { text: 'L\'ignorer', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'L\'attaquer', consequence: { xp: 10, pv: -15, stat: 'force' } }
    ]
  },
  {
    id: 'tresor',
    type: 'choice',
    text: 'Vous trouvez un coffre ancien!',
    choices: [
      { text: 'L\'ouvrir prudemment', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Le forcer', consequence: { xp: 5, pv: -5, stat: 'force' } },
      { text: 'L\'ignorer', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'piege',
    type: 'choice',
    text: 'Vous tombez dans un piège!',
    choices: [
      { text: 'Esquiver', consequence: { xp: 10, pv: -10, stat: 'agility' } },
      { text: 'Briser les chaînes', consequence: { xp: 20, pv: -20, stat: 'force' } },
      { text: 'Appeler à l\'aide', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'magic',
    type: 'choice',
    text: 'Une source de magie scintille devant vous.',
    choices: [
      { text: 'Boire', consequence: { xp: 25, pv: 20, stat: 'magie' } },
      { text: 'Collecter', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Ne pas y toucher', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
];

// Événements de combat (qui déclenchent un vrai combat)
export const COMBAT_EVENTS: RandomEvent[] = [
  {
    id: 'loup_ambush',
    type: 'combat',
    text: 'Un loup affamé surgit des fourrés et vous attaque!',
    monsterId: 'loup',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -10, stat: null } },
    ]
  },
  {
    id: 'gobelin_ambush',
    type: 'combat',
    text: 'Un groupe de goblins vous tend une embuscade!',
    monsterId: 'gobelin',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -5, stat: null } },
    ]
  },
  {
    id: 'bandit_ambush',
    type: 'combat',
    text: 'Des bandits barrent le chemin et exigent votre or!',
    monsterId: 'bandit',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -15, stat: null } },
    ]
  },
  {
    id: 'skeleton_encounter',
    type: 'combat',
    text: 'Un squelette guerrier émerge de l\'ombre, ses yeux brillant d\'une lumière maléfique!',
    monsterId: 'squelette',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -10, stat: null } },
    ]
  },
  {
    id: 'spider_encounter',
    type: 'combat',
    text: 'Une araignée géante descend du plafond, ses crocs prêts à frapper!',
    monsterId: 'spider',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -8, stat: null } },
    ]
  },
  {
    id: 'troll_encounter',
    type: 'combat',
    text: 'Un troll massif bloque le passage, sa massue traçant des arcs mortels dans l\'air!',
    monsterId: 'troll',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -25, stat: null } },
    ]
  },
  {
    id: 'vampire_encounter',
    type: 'combat',
    text: 'Un vampire surgit de l\'obscurité, ses yeux rouges luisant de faim!',
    monsterId: 'vampire',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -20, stat: null } },
    ]
  },
];

// Tous les événements组合
export const RANDOM_EVENTS: RandomEvent[] = [...NARRATIVE_EVENTS, ...COMBAT_EVENTS];

/**
 * Retourne un événement aléatoire (narratif OU combat selon le paramètre)
 */
export function getRandomEvent(allowCombat: boolean = true): RandomEvent {
  const events = allowCombat ? RANDOM_EVENTS : NARRATIVE_EVENTS;
  return events[Math.floor(Math.random() * events.length)];
}

/**
 * Retourne uniquement un événement de combat
 */
export function getRandomCombatEvent(): RandomEvent {
  return COMBAT_EVENTS[Math.floor(Math.random() * COMBAT_EVENTS.length)];
}

/**
 * Retourne uniquement un événement narratif (sans combat)
 */
export function getRandomNarrativeEvent(): RandomEvent {
  return NARRATIVE_EVENTS[Math.floor(Math.random() * NARRATIVE_EVENTS.length)];
}
