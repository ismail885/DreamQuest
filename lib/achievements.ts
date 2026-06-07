import { supabase } from "@/lib/supabaseClient";

const ACHIEVEMENT_STORAGE_KEY = "dq_last_achievements";

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
  lastPlayedAt?: string;
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
  { id: 'twenty_stories', title: 'Légende', description: 'Terminez 20 aventures', icon: 'Trophy', condition: (stats) => stats.storiesPlayed >= 20 },
  
  // Personnages créés
  { id: 'first_character', title: 'Création', description: 'Créez votre premier personnage', icon: 'UserPlus', condition: (stats) => stats.charactersCreated >= 1 },
  { id: 'five_characters', title: 'Collectionneur', description: 'Créez 5 personnages', icon: 'Users', condition: (stats) => stats.charactersCreated >= 5 },
  { id: 'ten_characters', title: 'Mécène', description: 'Créez 10 personnages', icon: 'UserCog', condition: (stats) => stats.charactersCreated >= 10 },
  
  // Votes/Likes
  { id: 'first_vote', title: 'Opinion', description: 'Votez pour votre première aventure', icon: 'ThumbsUp', condition: (stats) => stats.votes >= 1 },
  { id: 'ten_votes', title: 'Critique', description: 'Votez pour 10 aventures', icon: 'MessageSquare', condition: (stats) => stats.votes >= 10 },
  { id: 'fifty_votes', title: 'Influenceur', description: 'Votez pour 50 aventures', icon: 'Heart', condition: (stats) => stats.votes >= 50 },
  
  // Création d'aventures
  { id: 'first_creation', title: 'Créateur', description: 'Publiez votre première aventure', icon: 'Edit3', condition: (stats) => stats.storiesCreated >= 1 },
  { id: 'five_creations', title: 'Écrivain', description: 'Publiez 5 aventures', icon: 'Feather', condition: (stats) => stats.storiesCreated >= 5 },
  { id: 'popular_creator', title: 'Auteur Populaire', description: 'Atteignez 10 votes sur vos aventures', icon: 'Star', condition: (stats) => stats.totalLikes >= 10 },
  { id: 'star_creator', title: 'Icône', description: 'Atteignez 50 votes sur vos aventures', icon: 'Crown', condition: (stats) => stats.totalLikes >= 50 },
  
  // Niveau/XP
  { id: 'level_5', title: 'Montée en Puissance', description: 'Atteignez le niveau 5', icon: 'TrendingUp', condition: (stats) => stats.level >= 5 },
  { id: 'level_10', title: 'Expert', description: 'Atteignez le niveau 10', icon: 'Zap', condition: (stats) => stats.level >= 10 },
  { id: 'level_25', title: 'Maître', description: 'Atteignez le niveau 25', icon: 'Sword', condition: (stats) => stats.level >= 25 },
  { id: 'level_50', title: 'Légende Vivante', description: 'Atteignez le niveau 50', icon: 'Skull', condition: (stats) => stats.level >= 50 },
  { id: 'level_100', title: 'Immortal', description: 'Atteignez le niveau maximum', icon: 'Infinity', condition: (stats) => stats.level >= 100 },
  
  // DIVERS
  { id: 'night_owl', title: 'Noctambule', description: 'Jouez pendant la nuit', icon: 'Moon', condition: (stats) => { if (!stats.lastPlayedAt) return false; const h = new Date(stats.lastPlayedAt).getHours(); return h >= 22 || h < 6; } },
];

export function calculateAchievements(userStats: UserStatsInput): UserAchievements {
  const achievements: Achievement[] = ACHIEVEMENTS_CONFIG.map(config => ({
    id: config.id,
    title: config.title,
    description: config.description,
    icon: config.icon,
    unlocked: config.condition(userStats),
    unlockedAt: config.condition(userStats) ? new Date().toISOString() : undefined,
  }));

  const totalUnlocked = achievements.filter(a => a.unlocked).length;

  return {
    totalUnlocked,
    achievements,
  };
}

function getLastUnlockedIds(userId: number): string[] {
  try {
    const raw = localStorage.getItem(`${ACHIEVEMENT_STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUnlockedIds(userId: number, ids: string[]): void {
  try {
    localStorage.setItem(`${ACHIEVEMENT_STORAGE_KEY}_${userId}`, JSON.stringify(ids));
  } catch { /* empty */ }
}

/**
 * Vérifie les achievements après une action et notifie les nouveaux débloqués.
 */
export async function checkAndNotifyAchievements(
  userId: number,
  toastFn: (msg: string) => void,
): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from("utilisateur")
      .select("niveau")
      .eq("id", userId)
      .single();

    const { count: savesCount } = await supabase
      .from("sauvegarde")
      .select("*", { count: "exact", head: true })
      .eq("id_utilisateur", userId);

    const { count: charsCount } = await supabase
      .from("personnage")
      .select("*", { count: "exact", head: true })
      .eq("id_utilisateur", userId);

    const { count: votesCount } = await supabase
      .from("vote")
      .select("*", { count: "exact", head: true })
      .eq("id_utilisateur", userId);

    const { data: creations } = await supabase
      .from("aventure")
      .select("popularite")
      .eq("auteur_id", userId);

    const totalLikes = creations?.reduce((sum, c) => sum + (c.popularite || 0), 0) || 0;

    const result = calculateAchievements({
      storiesPlayed: savesCount ?? 0,
      charactersCreated: charsCount ?? 0,
      votes: votesCount ?? 0,
      storiesCreated: creations?.length ?? 0,
      totalLikes,
      level: profile?.niveau ?? 1,
    });

    const lastIds = getLastUnlockedIds(userId);
    for (const ach of result.achievements) {
      if (ach.unlocked && !lastIds.includes(ach.id)) {
        toastFn(`Succès débloqué : ${ach.title} 🏆`);
      }
    }

    saveUnlockedIds(
      userId,
      result.achievements.filter((a) => a.unlocked).map((a) => a.id),
    );
  } catch {
    /* échec silencieux */
  }
}