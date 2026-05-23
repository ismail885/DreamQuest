"use client";

import * as LucideIcons from "lucide-react";
import type { UserAchievements } from "@/lib/achievements";

interface TabAchievementsProps {
  achievements: UserAchievements | null;
}

const KNOWN_ICONS = [
  "BookOpen", "Medal", "Award", "UserPlus", "Users",
  "ThumbsUp", "MessageSquare", "Edit3", "Star", "TrendingUp",
  "Zap", "Moon", "Compass",
];

export default function TabAchievements({ achievements }: TabAchievementsProps) {
  if (!achievements) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune réalisation</h3>
        <p className="text-gray-400">Vos trophées et badges apparaîtront ici quand vous les débloquerez.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-cyan-400">{achievements.totalUnlocked}</div>
        <div className="text-gray-400 text-sm">réalisations débloquées</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.achievements.map((achievement) => {
          const iconName = achievement.icon;
          const iconClass = `w-6 h-6 ${achievement.unlocked ? "text-cyan-400" : "text-gray-500"}`;
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border ${
                achievement.unlocked
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-gray-800/30 border-gray-700/30 opacity-50"
              }`}
            >
              <div className="mb-2">
                {iconName === "BookOpen" && <LucideIcons.BookOpen className={iconClass} />}
                {iconName === "Medal" && <LucideIcons.Medal className={iconClass} />}
                {iconName === "Award" && <LucideIcons.Award className={iconClass} />}
                {iconName === "UserPlus" && <LucideIcons.UserPlus className={iconClass} />}
                {iconName === "Users" && <LucideIcons.Users className={iconClass} />}
                {iconName === "ThumbsUp" && <LucideIcons.ThumbsUp className={iconClass} />}
                {iconName === "MessageSquare" && <LucideIcons.MessageSquare className={iconClass} />}
                {iconName === "Edit3" && <LucideIcons.Edit3 className={iconClass} />}
                {iconName === "Star" && <LucideIcons.Star className={iconClass} />}
                {iconName === "TrendingUp" && <LucideIcons.TrendingUp className={iconClass} />}
                {iconName === "Zap" && <LucideIcons.Zap className={iconClass} />}
                {iconName === "Moon" && <LucideIcons.Moon className={iconClass} />}
                {iconName === "Compass" && <LucideIcons.Compass className={iconClass} />}
                {!KNOWN_ICONS.includes(iconName) && <LucideIcons.HelpCircle className={iconClass} />}
              </div>
              <h4 className={`font-semibold ${achievement.unlocked ? "text-white" : "text-gray-500"}`}>
                {achievement.title}
              </h4>
              <p className={`text-xs ${achievement.unlocked ? "text-gray-400" : "text-gray-600"}`}>
                {achievement.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
