import { supabase } from "@/lib/supabaseClient";

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  icon: string;
  completed: boolean;
}

export interface DailyQuestData {
  quests: DailyQuest[];
  lastReset: string;
}

const QUEST_POOL: Omit<DailyQuest, "progress" | "completed" | "completedAt">[] = [
  { id: "finish_2", title: "Aventurier", description: "Terminer 2 aventures", target: 2, xpReward: 200, icon: "BookOpen" },
  { id: "finish_1", title: "Explorateur", description: "Terminer 1 aventure", target: 1, xpReward: 100, icon: "Compass" },
  { id: "vote_3", title: "Curieux", description: "Voter pour 3 histoires", target: 3, xpReward: 150, icon: "ThumbsUp" },
  { id: "create_char", title: "Créateur", description: "Créer un personnage", target: 1, xpReward: 50, icon: "UserPlus" },
  { id: "play_story", title: "Lecteur", description: "Commencer une aventure", target: 1, xpReward: 25, icon: "BookMarked" },
];

function getDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function mapDbQuestToDailyQuest(dbRow: { quest_id: string; progression: number; complet: boolean; date_jour: string }): DailyQuest | null {
  const poolQuest = QUEST_POOL.find(q => q.id === dbRow.quest_id);
  if (!poolQuest) return null;
  return {
    ...poolQuest,
    progress: dbRow.progression,
    completed: dbRow.complet,
  };
}

export async function getDailyQuests(userId: number): Promise<DailyQuestData> {
  const today = getDateKey();

  // Charger les quetes du jour depuis la BDD
  const { data: dbQuests } = await supabase
    .from("quete_quotidienne")
    .select("*")
    .eq("id_utilisateur", userId)
    .eq("date_jour", today);

  if (dbQuests && dbQuests.length > 0) {
    const quests: DailyQuest[] = dbQuests
      .map(row => mapDbQuestToDailyQuest(row))
      .filter((q): q is DailyQuest => q !== null);

    return { quests, lastReset: today };
  }

  // Pas de quetes aujourd'hui → en generer 3 aleatoires
  const randomQuests = [...QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  
  // Insérer en BDD
  const newRows = randomQuests.map(q => ({
    id_utilisateur: userId,
    quest_id: q.id,
    progression: 0,
    complet: false,
    date_jour: today,
  }));

  const { data: inserted } = await supabase
    .from("quete_quotidienne")
    .insert(newRows)
    .select();

  const quests: DailyQuest[] = (inserted || [])
    .map(row => mapDbQuestToDailyQuest(row))
    .filter((q): q is DailyQuest => q !== null);

  return { quests, lastReset: today };
}

export async function updateQuestProgress(userId: number, questId: string, amount: number = 1): Promise<DailyQuestData> {
  const today = getDateKey();

  // Charger la quete actuelle
  const { data: existing } = await supabase
    .from("quete_quotidienne")
    .select("*")
    .eq("id_utilisateur", userId)
    .eq("quest_id", questId)
    .eq("date_jour", today)
    .maybeSingle();

  if (!existing || existing.complet) {
    // Si deja complete ou inexistante, retourner l'etat actuel
    return getDailyQuests(userId);
  }

  const poolQuest = QUEST_POOL.find(q => q.id === questId);
  const target = poolQuest?.target ?? 1;
  const newProgress = Math.min(existing.progression + amount, target);
  const newComple = newProgress >= target;

  await supabase
    .from("quete_quotidienne")
    .update({ progression: newProgress, complet: newComple })
    .eq("id", existing.id);

  return getDailyQuests(userId);
}

export function getTotalXPReward(data: DailyQuestData): number {
  return data.quests
    .filter(q => q.completed)
    .reduce((sum, q) => sum + q.xpReward, 0);
}
