"use client";

import { motion } from "framer-motion";
import { UserStats } from "@/hooks/useDashboardData";
import { getLevelFromXP, getXPInCurrentLevel, getXPForNextLevel } from "@/lib/leveling";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardStatsProps {
  stats: UserStats;
  loading: boolean;
  error: string | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

type StatCardDef = {
  key: string;
  labelKey: string;
  gradient: string;
  border: string;
  text: string;
  suffix: string;
};

export default function DashboardStats({ stats, loading, error }: DashboardStatsProps) {
  const { t } = useLanguage();

  const statCards: StatCardDef[] = [
    { key: "charactersCount", labelKey: t("dashboard.stats.characters"), gradient: "from-cyan-500/10 to-blue-500/10", border: "border-cyan-500/20 hover:border-cyan-400/50", text: "text-cyan-400", suffix: "" },
    { key: "completedQuests", labelKey: t("dashboard.stats.quests"), gradient: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/20 hover:border-purple-400/50", text: "text-purple-400", suffix: "" },
    { key: "maxLevel", labelKey: t("dashboard.stats.maxLevel"), gradient: "from-green-500/10 to-emerald-500/10", border: "border-green-500/20 hover:border-green-400/50", text: "text-green-400", suffix: "" },
  ];

  return (
    <div className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 sticky top-16 md:top-20 z-20 bg-deep/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
        {t("dashboard.statsTitle")}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface-card border border-gray-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 animate-pulse"
            >
              <div className="h-8 bg-gray-700/50 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-700/50 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((card) => {
            const value = stats[card.key as keyof UserStats];
            const display = card.key === "maxLevel" && (value as number) <= 0 ? "—" : value;
            return (
              <motion.div
                key={card.key}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  transition: {
                    duration: 0.3,
                    ease: [0.25, 1, 0.5, 1] as const,
                  },
                }}
                className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl md:rounded-2xl p-4 md:p-6 transition-colors duration-300 cursor-default`}
              >
                <div className={`text-2xl md:text-3xl font-bold ${card.text} mb-1 md:mb-2`}>
                  {display}
                </div>
                <div className="text-gray-300 text-xs md:text-sm">{card.labelKey}</div>
              </motion.div>
            );
          })}

          {/* Carte Niveau utilisateur avec barre XP */}
          <motion.div
            key="userLevel"
            variants={cardVariants}
            whileHover={{
              y: -4,
              transition: {
                duration: 0.3,
                ease: [0.25, 1, 0.5, 1] as const,
              },
            }}
            className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 hover:border-violet-400/50 rounded-xl md:rounded-2xl p-4 md:p-6 transition-colors duration-300 cursor-default"
          >
            <div className="text-2xl md:text-3xl font-bold text-violet-400 mb-1 md:mb-2">
              {getLevelFromXP(stats.userXp)}
            </div>
            <div className="text-gray-300 text-xs md:text-sm mb-3">{t("dashboard.stats.userLevel")}</div>

            {/* Barre de progression XP */}
            {(() => {
              const totalXp = stats.userXp;
              const currentLevel = getLevelFromXP(totalXp);
              const currentXp = getXPInCurrentLevel(currentLevel, totalXp);
              const xpForNext = getXPForNextLevel(currentLevel);
              const progress = xpForNext > 0 ? Math.min((currentXp / xpForNext) * 100, 100) : 0;
              return (
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-[10px] md:text-xs text-right">
                    {currentXp.toLocaleString()} / {xpForNext.toLocaleString()} XP
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
