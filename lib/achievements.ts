export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserAchievements {
  totalUnlocked: number;
  achievements: Achievement[];
}

interface UserStatsInput {
  storiesPlayed: number;
  charactersCreated: number;
  votes: number;
  storiesCreated: number;
  totalLikes: number;
  level: number;
}

// Liste des achievements disponibles (utilise les noms des icônes Lucide)
export const ACHIEVEMENTS_CONFIG: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStatsInput) => boolean;
}> = [
  // Histoires jouées
  { id: 'first_story', title: 'Premier Pas', description: 'Terminez votre première aventure', icon: 'BookOpen', condition: (stats) => stats.storiesPlayed >= 1 },
  { id: 'five_stories', title: 'Aventurier Expérimenté', description: 'Terminez 5 aventures', icon: 'Medal', condition: (stats) => stats.storiesPlayed >= 5 },
  { id: 'ten_stories', title: 'Vétéran', description: 'Terminez 10 aventures', icon: 'Award', condition: (stats) => stats.storiesPlayed >= 10 },
  
  // Personnages créés
  { id: 'first_character', title: 'Création', description: 'Créez votre premier personnage', icon: 'UserPlus', condition: (stats) => stats.charactersCreated >= 1 },
  { id: 'five_characters', title: 'Collectionneur', description: 'Créez 5 personnages', icon: 'Users', condition: (stats) => stats.charactersCreated >= 5 },
  
  // Votes/Likes
  { id: 'first_vote', title: 'Opinion', description: 'Votez pour votre première aventure', icon: 'ThumbsUp', condition: (stats) => stats.votes >= 1 },
  { id: 'ten_votes', title: 'Critique', description: 'Votez pour 10 aventures', icon: 'MessageSquare', condition: (stats) => stats.votes >= 10 },
  
  // Création d'aventures
  { id: 'first_creation', title: 'Créateur', description: 'Publiez votre première aventure', icon: 'Edit3', condition: (stats) => stats.storiesCreated >= 1 },
  { id: 'popular_creator', title: 'Auteur Populaire', description: 'Atteignez 10 votes sur vos aventures', icon: 'Star', condition: (stats) => stats.totalLikes >= 10 },
  
  // Niveau/XP
  { id: 'level_5', title: 'Montée en Puissance', description: 'Atteignez le niveau 5', icon: 'TrendingUp', condition: (stats) => stats.level >= 5 },
  { id: 'level_10', title: 'Expert', description: 'Atteignez le niveau 10', icon: 'Zap', condition: (stats) => stats.level >= 10 },
  
  // DIVERS
  { id: 'night_owl', title: 'Noctambule', description: 'Jouez pendant la nuit', icon: 'Moon', condition: () => { const h = new Date().getHours(); return h >= 22 || h < 6; } },
  { id: 'explorer', title: 'Explorateur', description: 'Jouez à 5 aventures différentes', icon: 'Compass', condition: (stats) => stats.storiesPlayed >= 5 },
];

export function calculateAchievements(userStats: UserStatsInput): UserAchievements {
  const achievements: Achievement[] = ACHIEVEMENTS_CONFIG.map(config => ({
    id: config.id,
    title: config.title,
    description: config.description,
    icon: config.icon,
    unlocked: config.condition(userStats),
  }));

  const totalUnlocked = achievements.filter(a => a.unlocked).length;

  return {
    totalUnlocked,
    achievements,
  };
}