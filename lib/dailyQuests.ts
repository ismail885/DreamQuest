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

export function getDailyQuests(userId: number): DailyQuestData {
  const key = `dq_quests_${userId}`;
  const saved = localStorage.getItem(key);
  
  if (saved) {
    try {
      const data: DailyQuestData = JSON.parse(saved);
      if (data.lastReset === getDateKey()) {
        return data;
      }
    } catch { }
  }
  
  const randomQuests = QUEST_POOL.sort(() => Math.random() - 0.5).slice(0, 3);
  const newQuests: DailyQuest[] = randomQuests.map(q => ({
    ...q,
    progress: 0,
    completed: false,
  }));
  
  const newData: DailyQuestData = {
    quests: newQuests,
    lastReset: getDateKey(),
  };
  
  localStorage.setItem(key, JSON.stringify(newData));
  return newData;
}

export function updateQuestProgress(userId: number, questId: string, amount: number = 1): DailyQuestData {
  const data = getDailyQuests(userId);
  const key = `dq_quests_${userId}`;
  
  const updated = data.quests.map(q => {
    if (q.id === questId && !q.completed) {
      const newProgress = Math.min(q.progress + amount, q.target);
      return { ...q, progress: newProgress, completed: newProgress >= q.target };
    }
    return q;
  });
  
  const newData = { ...data, quests: updated };
  localStorage.setItem(key, JSON.stringify(newData));
  return newData;
}

export function getTotalXPReward(data: DailyQuestData): number {
  return data.quests
    .filter(q => q.completed)
    .reduce((sum, q) => sum + q.xpReward, 0);
}