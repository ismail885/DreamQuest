"use client";

import type { DailyQuest } from "@/lib/dailyQuests";
import { getTotalXPReward } from "@/lib/dailyQuests";

interface TabQuestsProps {
  quests: DailyQuest[];
}

export default function TabQuests({ quests }: TabQuestsProps) {
  if (quests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Chargement des quêtes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Quêtes du jour</h3>
        <span className="text-cyan-400 font-bold">
          +{getTotalXPReward({ quests, lastReset: "" })} XP
        </span>
      </div>
      {quests.map((quest) => {
        const percent = Math.round((quest.progress / quest.target) * 100);
        return (
          <div
            key={quest.id}
            className={`p-4 rounded-xl border ${
              quest.completed
                ? "bg-green-500/10 border-green-500/30"
                : "bg-[#0c1322] border-gray-700/30"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {quest.completed && (
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <h4 className={`font-semibold ${quest.completed ? "text-green-400" : "text-white"}`}>
                  {quest.title}
                </h4>
              </div>
              <span className="text-yellow-400 text-sm">+{quest.xpReward} XP</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{quest.description}</p>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progression</span>
              <span>{quest.progress} / {quest.target}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  quest.completed
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
