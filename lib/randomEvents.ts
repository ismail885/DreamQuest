// Événements aléatoires dans les aventures
export const RANDOM_EVENTS = [
  {
    id: 'rencontre',
    text: 'Vous rencontrez un voyageur solitaire qui vous demande de l\'aide.',
    choices: [
      { text: 'Lui parler', consequence: { xp: 20, pv: 0, stat: null } },
      { text: 'L\'ignorer', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'L\'attaquer', consequence: { xp: 10, pv: -15, stat: 'force' } }
    ]
  },
  {
    id: 'tresor',
    text: 'Vous trouvez un coffre ancien!',
    choices: [
      { text: 'L\'ouvrir prudemment', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Le forcer', consequence: { xp: 5, pv: -5, stat: 'force' } },
      { text: 'L\'ignorer', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'piege',
    text: 'Vous tombez dans un piège!',
    choices: [
      { text: 'Esquiver', consequence: { xp: 10, pv: -10, stat: 'agility' } },
      { text: 'Briser les chaînes', consequence: { xp: 20, pv: -20, stat: 'force' } },
      { text: 'Appeler à l\'aide', consequence: { xp: 5, pv: 0, stat: null } }
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
    text: 'Une créature mystérieuse apparaît!',
    choices: [
      { text: 'Combattre', consequence: { xp: 30, pv: -15, stat: 'force' } },
      { text: 'Fuir', consequence: { xp: 5, pv: 0, stat: 'agility' } },
      { text: 'Parler', consequence: { xp: 20, pv: 0, stat: 'magie' } }
    ]
  }
];

export function getRandomEvent(): typeof RANDOM_EVENTS[0] {
  return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
}
