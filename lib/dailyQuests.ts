import { supabase } from "@/lib/supabaseClient";
import { addExperience } from "@/lib/leveling";
import { getCurrentSeason } from "@/lib/seasons";

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

export interface QuestCompletionResult {
  questId: string;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel: number;
}

const QUEST_POOL: Omit<DailyQuest, "progress" | "completed">[] = [
  { id: "finish_2", title: "Aventurier", description: "Terminer 2 aventures", target: 2, xpReward: 200, icon: "BookOpen" },
  { id: "finish_1", title: "Explorateur", description: "Terminer 1 aventure", target: 1, xpReward: 100, icon: "Compass" },
  { id: "vote_3", title: "Curieux", description: "Voter pour 3 histoires", target: 3, xpReward: 150, icon: "ThumbsUp" },
  { id: "create_char", title: "Créateur", description: "Créer un personnage", target: 1, xpReward: 50, icon: "UserPlus" },
  { id: "play_story", title: "Lecteur", description: "Commencer une aventure", target: 1, xpReward: 25, icon: "BookMarked" },
];

function getSeasonalQuestPool(): Omit<DailyQuest, "progress" | "completed">[] {
  const season = getCurrentSeason();
  return QUEST_POOL.filter(q => season.questPool.includes(q.id));
}

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

function generateLocalQuests(): DailyQuest[] {
  const pool = getSeasonalQuestPool();
  if (pool.length === 0) return [];

  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(3, pool.length))
    .map(q => ({
      ...q,
      progress: 0,
      completed: false,
    }));
}

export async function getDailyQuests(userId: number): Promise<DailyQuestData> {
  const today = getDateKey();

  const { data: dbQuests, error: selectError } = await supabase
    .from("quete_quotidienne")
    .select("*")
    .eq("id_utilisateur", userId)
    .eq("date_jour", today);

  if (selectError) {
    console.warn("[DailyQuests] Erreur SELECT, fallback local :", selectError.message);
    return { quests: generateLocalQuests(), lastReset: today };
  }

  if (dbQuests && dbQuests.length > 0) {
    const quests: DailyQuest[] = dbQuests
      .map(row => mapDbQuestToDailyQuest(row))
      .filter((q): q is DailyQuest => q !== null);

    return { quests, lastReset: today };
  }

  const pool = getSeasonalQuestPool();
  const randomQuests = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(3, pool.length));

  const newRows = randomQuests.map(q => ({
    id_utilisateur: userId,
    quest_id: q.id,
    progression: 0,
    complet: false,
    date_jour: today,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("quete_quotidienne")
    .insert(newRows)
    .select();

  if (insertError) {
    console.warn("[DailyQuests] Erreur INSERT, fallback local :", insertError.message);
    return { quests: generateLocalQuests(), lastReset: today };
  }

  const quests: DailyQuest[] = (inserted || [])
    .map(row => mapDbQuestToDailyQuest(row))
    .filter((q): q is DailyQuest => q !== null);

  return { quests, lastReset: today };
}

export async function updateQuestProgress(
  userId: number,
  questId: string,
  amount: number = 1,
): Promise<DailyQuestData & { completion?: QuestCompletionResult }> {
  const today = getDateKey();
  const safeAmount = Math.max(1, Math.min(amount, 100));

  const { data: existing } = await supabase
    .from("quete_quotidienne")
    .select("*")
    .eq("id_utilisateur", userId)
    .eq("quest_id", questId)
    .eq("date_jour", today)
    .maybeSingle();

  if (!existing || existing.complet) {
    return getDailyQuests(userId);
  }

  const poolQuest = QUEST_POOL.find(q => q.id === questId);
  const target = poolQuest?.target ?? 1;
  const newProgress = Math.min(existing.progression + safeAmount, target);
  const justCompleted = !existing.complet && newProgress >= target;

  await supabase
    .from("quete_quotidienne")
    .update({ progression: newProgress, complet: justCompleted })
    .eq("id", existing.id);

  let completion: QuestCompletionResult | undefined;
  if (justCompleted && poolQuest) {
    const result = await addExperience(userId, poolQuest.xpReward, `quête:${questId}`);
    completion = {
      questId,
      xpAwarded: poolQuest.xpReward,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    };

  }

  const questData = await getDailyQuests(userId);
  return { ...questData, completion };
}

export function getTotalXPReward(data: DailyQuestData): number {
  return data.quests
    .filter(q => q.completed)
    .reduce((sum, q) => sum + q.xpReward, 0);
}
