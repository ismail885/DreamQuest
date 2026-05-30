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
  {
    id: 'feu_de_camp',
    type: 'choice',
    text: 'Vous trouvez un feu de camp abandonné, encore chaud. Des provisions gisent à côté.',
    choices: [
      { text: 'Manger et se reposer', consequence: { xp: 10, pv: 20, stat: null } },
      { text: 'Fouiller les affaires', consequence: { xp: 20, pv: -5, stat: null } },
      { text: 'Repartir aussitôt', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'pont_effondre',
    type: 'choice',
    text: 'Un pont de cordes tremble dangereusement au-dessus d\'un ravin. Il semble sur le point de lâcher.',
    choices: [
      { text: 'Le traverser rapidement', consequence: { xp: 20, pv: -15, stat: 'agility' } },
      { text: 'Chercher un autre passage', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Le réparer sommairement', consequence: { xp: 25, pv: -5, stat: 'force' } }
    ]
  },
  {
    id: 'marchand_ambulant',
    type: 'choice',
    text: 'Un marchand ambulant installe son étal sur le bord du chemin. Sa marchandise semble de qualité.',
    choices: [
      { text: 'Acheter une potion', consequence: { xp: 0, pv: 25, stat: null } },
      { text: 'Échanger des informations', consequence: { xp: 30, pv: 0, stat: null } },
      { text: 'Le détrousser', consequence: { xp: 15, pv: -20, stat: null } }
    ]
  },
  {
    id: 'statue_ancienne',
    type: 'choice',
    text: 'Une statue massive aux yeux de rubis vous fixe. Une inscription en langage ancien orne le piédestal.',
    choices: [
      { text: 'Déchiffrer l\'inscription', consequence: { xp: 30, pv: 0, stat: 'magie' } },
      { text: 'Tenter d\'arracher les rubis', consequence: { xp: 10, pv: -15, stat: null } },
      { text: 'Saluer la statue', consequence: { xp: 15, pv: 10, stat: null } }
    ]
  },
  {
    id: 'tempete_magique',
    type: 'choice',
    text: 'Le ciel vire au violet. Des éclairs d\'énergie crépitent et l\'air devient électrique.',
    choices: [
      { text: 'Chercher un abri', consequence: { xp: 5, pv: 0, stat: null } },
      { text: 'Absorber l\'énergie', consequence: { xp: 35, pv: -20, stat: 'magie' } },
      { text: 'Continuer sous la tempête', consequence: { xp: 15, pv: -10, stat: null } }
    ]
  },
  {
    id: 'ermite',
    type: 'choice',
    text: 'Un ermite vit seul dans une hutte au milieu des bois. Il vous fait signe d\'approcher.',
    choices: [
      { text: 'Accepter son hospitalité', consequence: { xp: 20, pv: 15, stat: null } },
      { text: 'Lui demander des conseils', consequence: { xp: 30, pv: 0, stat: null } },
      { text: 'Fouiller sa hutte en son absence', consequence: { xp: 10, pv: -10, stat: null } }
    ]
  },
  {
    id: 'cascade_cachee',
    type: 'choice',
    text: 'Derrière une cascade rugissante, vous apercevez l\'entrée d\'une grotte.',
    choices: [
      { text: 'Explorer la grotte', consequence: { xp: 25, pv: -10, stat: null } },
      { text: 'Boire l\'eau fraîche', consequence: { xp: 5, pv: 15, stat: null } },
      { text: 'Noter l\'emplacement', consequence: { xp: 10, pv: 0, stat: null } }
    ]
  },
  {
    id: 'puits_a_souhaits',
    type: 'choice',
    text: 'Un puits en pierre moussue émet une lueur bleutée. Des pièces brillent au fond.',
    choices: [
      { text: 'Jeter une pièce et faire un voeu', consequence: { xp: 30, pv: 5, stat: null } },
      { text: 'Descendre au fond du puits', consequence: { xp: 20, pv: -25, stat: null } },
      { text: 'L\'ignorer', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'foret_ensorcelee',
    type: 'choice',
    text: 'Les arbres autour de vous semblent bouger. Le chemin s\'est effacé, remplacé par des sentiers lumineux.',
    choices: [
      { text: 'Suivre la lueur bleue', consequence: { xp: 25, pv: 5, stat: 'magie' } },
      { text: 'Suivre la lueur rouge', consequence: { xp: 15, pv: -15, stat: 'force' } },
      { text: 'Tracer votre propre chemin', consequence: { xp: 20, pv: 0, stat: 'agility' } }
    ]
  },
  {
    id: 'cimetiere_ancien',
    type: 'choice',
    text: 'Un cimetière oublié s\'étend devant vous. Des murmures s\'élèvent des tombes.',
    choices: [
      { text: 'Examiner les tombes', consequence: { xp: 20, pv: -5, stat: null } },
      { text: 'Parler aux esprits', consequence: { xp: 35, pv: -10, stat: 'magie' } },
      { text: 'Fuir ce lieu sinistre', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'festin_villageois',
    type: 'choice',
    text: 'Un village organise une fête en plein air. Musique, danse et nourriture abondent.',
    choices: [
      { text: 'Participer à la fête', consequence: { xp: 15, pv: 20, stat: null } },
      { text: 'Parler aux villageois', consequence: { xp: 25, pv: 0, stat: null } },
      { text: 'Voler pendant la fête', consequence: { xp: 20, pv: -10, stat: null } }
    ]
  },
  {
    id: 'champ_de_bataille',
    type: 'choice',
    text: 'Les vestiges d\'une ancienne bataille jonchent le sol. Armes brisées et ossements blanchis.',
    choices: [
      { text: 'Chercher des armes intactes', consequence: { xp: 20, pv: 0, stat: 'force' } },
      { text: 'Enterrer les morts', consequence: { xp: 30, pv: 5, stat: null } },
      { text: 'Piller les dépouilles', consequence: { xp: 15, pv: -10, stat: null } }
    ]
  },
  {
    id: 'autel_elementaire',
    type: 'choice',
    text: 'Quatre autels dédiés aux éléments (terre, feu, eau, air) sont disposés en cercle.',
    choices: [
      { text: 'Invoquer la puissance du feu', consequence: { xp: 25, pv: -15, stat: 'magie' } },
      { text: 'Méditer sur l\'autel d\'eau', consequence: { xp: 20, pv: 15, stat: null } },
      { text: 'Prendre une pierre sacrée', consequence: { xp: 15, pv: 5, stat: 'force' } }
    ]
  },
  {
    id: 'marais_toxique',
    type: 'choice',
    text: 'Des bulles de gaz empoisonné éclatent à la surface du marais. Une brume verdâtre vous enveloppe.',
    choices: [
      { text: 'Retenir son souffle et traverser', consequence: { xp: 20, pv: -15, stat: 'endurance' } },
      { text: 'Fabriquer un masque de fortune', consequence: { xp: 25, pv: -5, stat: null } },
      { text: 'Faire demi-tour', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'bibliotheque_itinerante',
    type: 'choice',
    text: 'Une charrette chargée de livres est arrêtée sur le chemin. Son propriétaire lit paisiblement.',
    choices: [
      { text: 'Feuilleter les grimoires', consequence: { xp: 30, pv: 0, stat: 'magie' } },
      { text: 'Acheter une carte de la région', consequence: { xp: 20, pv: 0, stat: null } },
      { text: 'Voler un livre rare', consequence: { xp: 15, pv: -15, stat: null } }
    ]
  },
  {
    id: 'cercles_de_pierre',
    type: 'choice',
    text: 'Un cercle de menhirs irradie une énergie mystérieuse. Les runes gravées brillent faiblement.',
    choices: [
      { text: 'Activer les runes', consequence: { xp: 40, pv: -20, stat: 'magie' } },
      { text: 'Dessiner votre propre rune', consequence: { xp: 25, pv: 10, stat: null } },
      { text: 'Dormir au centre du cercle', consequence: { xp: 10, pv: 30, stat: null } }
    ]
  },
  {
    id: 'dispute_marchande',
    type: 'choice',
    text: 'Deux commerçants se disputent violemment sur le marché. Une foule commence à s\'attrouper.',
    choices: [
      { text: 'Tenter de les calmer', consequence: { xp: 25, pv: 0, stat: null } },
      { text: 'Profiter de la confusion pour voler', consequence: { xp: 15, pv: -10, stat: null } },
      { text: 'Regarder le spectacle', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'meteorite',
    type: 'choice',
    text: 'Une traînée de feu déchire le ciel. Un impact retentit non loin de vous.',
    choices: [
      { text: 'Examiner le cratère', consequence: { xp: 30, pv: -5, stat: null } },
      { text: 'Collecter des fragments', consequence: { xp: 20, pv: 0, stat: 'force' } },
      { text: 'Fuir l\'impact', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'guerisseuse',
    type: 'choice',
    text: 'Une vieille guérisseuse cueille des herbes dans la forêt. Elle vous propose ses services.',
    choices: [
      { text: 'Accepter ses soins', consequence: { xp: 5, pv: 35, stat: null } },
      { text: 'Apprendre une recette', consequence: { xp: 30, pv: 0, stat: 'magie' } },
      { text: 'Refuser poliment', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'passage_secret',
    type: 'choice',
    text: 'Vous remarquez des traces de pas qui disparaissent derrière un mur de lierre. Un passage secret?',
    choices: [
      { text: 'Fouiller le mur', consequence: { xp: 25, pv: -5, stat: null } },
      { text: 'Suivre les traces', consequence: { xp: 20, pv: 0, stat: 'agility' } },
      { text: 'Ignorer et continuer', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
  {
    id: 'fontaine_magique',
    type: 'choice',
    text: 'L\'eau d\'une fontaine en marbre blanc scintille comme des diamants liquides.',
    choices: [
      { text: 'Boire l\'eau lumineuse', consequence: { xp: 20, pv: 25, stat: 'magie' } },
      { text: 'Remplir une fiole', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Jeter une offrande', consequence: { xp: 10, pv: 10, stat: null } }
    ]
  },
  {
    id: 'course_poursuite',
    type: 'choice',
    text: 'Un homme poursuivi par des gardes fonce dans votre direction et vous supplie de l\'aider.',
    choices: [
      { text: 'Cacher le fugitif', consequence: { xp: 30, pv: 0, stat: 'agility' } },
      { text: 'Ne pas s\'impliquer', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Aider les gardes à l\'attraper', consequence: { xp: 15, pv: 0, stat: null } }
    ]
  },
  {
    id: 'nids_d_harpies',
    type: 'choice',
    text: 'Des cris perçants résonnent au-dessus. Un nid d\'harpies est perché sur les falaises.',
    choices: [
      { text: 'Escalader vers le nid', consequence: { xp: 30, pv: -20, stat: 'agility' } },
      { text: 'Leur lancer des pierres', consequence: { xp: 15, pv: -10, stat: 'force' } },
      { text: 'Contourner discrètement', consequence: { xp: 10, pv: 0, stat: null } }
    ]
  },
  {
    id: 'orage_violent',
    type: 'choice',
    text: 'Un orage d\'une violence rare éclate. La pluie tombe à verse et le vent menace de vous déraciner.',
    choices: [
      { text: 'Chercher une caverne', consequence: { xp: 10, pv: 5, stat: null } },
      { text: 'Utiliser la magie pour vous protéger', consequence: { xp: 25, pv: -10, stat: 'magie' } },
      { text: 'Continuer sous la pluie', consequence: { xp: 15, pv: -15, stat: 'endurance' } }
    ]
  },
  {
    id: 'reveil_brutal',
    type: 'choice',
    text: 'Vous vous réveillez en sursaut. Un campement a été installé près du vôtre pendant votre sommeil.',
    choices: [
      { text: 'Aller les saluer', consequence: { xp: 15, pv: 0, stat: null } },
      { text: 'Les observer en secret', consequence: { xp: 20, pv: 0, stat: null } },
      { text: 'Plier bagage et partir', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'epee_dans_la_pierre',
    type: 'choice',
    text: 'Une épée fichée dans un roc attire votre regard. La légende dit que seul l\'élu peut la retirer.',
    choices: [
      { text: 'Tenter de la retirer', consequence: { xp: 35, pv: -10, stat: 'force' } },
      { text: 'Examiner les runes', consequence: { xp: 20, pv: 0, stat: null } },
      { text: 'La laisser tranquille', consequence: { xp: 5, pv: 0, stat: null } }
    ]
  },
  {
    id: 'enchanteur_errant',
    type: 'choice',
    text: 'Un enchanteur propose d\'améliorer votre équipement... moyennant un service.',
    choices: [
      { text: 'Accepter le marché', consequence: { xp: 30, pv: 0, stat: 'force' } },
      { text: 'Négocier un meilleur prix', consequence: { xp: 20, pv: 5, stat: null } },
      { text: 'Le menacer pour un service gratuit', consequence: { xp: 10, pv: -20, stat: null } }
    ]
  },
  {
    id: 'pont_naturel',
    type: 'choice',
    text: 'Un tronc d\'arbre gigantesque enjambe une rivière tumultueuse. Il est glissant et instable.',
    choices: [
      { text: 'Traverser en équilibre', consequence: { xp: 20, pv: -10, stat: 'agility' } },
      { text: 'Nager dans la rivière', consequence: { xp: 15, pv: -5, stat: 'endurance' } },
      { text: 'Suivre la rivière en aval', consequence: { xp: 10, pv: 0, stat: null } }
    ]
  },
  {
    id: 'champignons_etranges',
    type: 'choice',
    text: 'Un cercle de champignons phosphorescents émet une lueur hypnotique. Leur odeur est enivrante.',
    choices: [
      { text: 'Les cueillir prudemment', consequence: { xp: 20, pv: -10, stat: null } },
      { text: 'Manger un champignon', consequence: { xp: 35, pv: -15, stat: 'magie' } },
      { text: 'Les ignorer', consequence: { xp: 0, pv: 0, stat: null } }
    ]
  },
];

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
    monsterId: 'araignee',
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
  {
    id: 'ours_grogneur',
    type: 'combat',
    text: 'Un ours brun énorme, dérangé dans sa tanière, se dresse devant vous en grognant!',
    monsterId: 'ours',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -18, stat: null } },
    ]
  },
  {
    id: 'golem_de_pierre',
    type: 'combat',
    text: 'Un golem de pierre s\'anime devant une entrée scellée. Ses poings massifs frappent le sol!',
    monsterId: 'golem',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -20, stat: null } },
    ]
  },
  {
    id: 'bande_de_rates',
    type: 'combat',
    text: 'Une nuée de rats géants surgit des égouts, leurs yeux rouges brillant de faim!',
    monsterId: 'rats',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -6, stat: null } },
    ]
  },
  {
    id: 'spectre_vengeur',
    type: 'combat',
    text: 'Un spectre translucide traverse le mur et se jette sur vous, ses doigts glacés cherchant votre gorge!',
    monsterId: 'spectre',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -15, stat: null } },
    ]
  },
  {
    id: 'guerriers_orcs',
    type: 'combat',
    text: 'Trois guerriers orcs armés de haches vous barrent la route en riant sauvagement!',
    monsterId: 'orc',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -15, stat: null } },
    ]
  },
  {
    id: 'plante_vorace',
    type: 'combat',
    text: 'Une plante carnivore géante déploie ses lianes pour vous attraper et vous dévorer!',
    monsterId: 'plante',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -10, stat: null } },
    ]
  },
  {
    id: 'assassin_furtif',
    type: 'combat',
    text: 'Une ombre se détache du mur. Un assassin masqué vous attaque par surprise, dague en avant!',
    monsterId: 'assassin',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -12, stat: null } },
    ]
  },
  {
    id: 'manticore',
    type: 'combat',
    text: 'Une manticore rugit depuis un rocher surplombant. Sa queue barbelée se balance prête à frapper!',
    monsterId: 'manticore',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -25, stat: null } },
    ]
  },
  {
    id: 'elementaire_de_feu',
    type: 'combat',
    text: 'Un élémentaire de feu rugit hors d\'un brasier, projetant des langues de flammes brûlantes!',
    monsterId: 'elementaire',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -20, stat: null } },
    ]
  },
  {
    id: 'soldats_squelettes',
    type: 'combat',
    text: 'Une patrouille de soldats squelettes en armure rouillée marche en formation, lances pointées vers vous!',
    monsterId: 'soldat_squelette',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -12, stat: null } },
    ]
  },
  {
    id: 'harceleur_tenebreux',
    type: 'combat',
    text: 'Une créature faite de ténèbres pures émerge du sol, ses tentacules obscurs cherchant à vous engloutir!',
    monsterId: 'tenebres',
    choices: [
      { text: 'Combattre', consequence: { xp: 0, pv: 0, stat: null } },
      { text: 'Fuir', consequence: { xp: 0, pv: -18, stat: null } },
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
