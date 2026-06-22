"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { UserAchievements } from "@/lib/achievements";
import type { UserTrophies, Trophy } from "@/lib/trophies";

interface TabAchievementsProps {
  achievements: UserAchievements | null;
  trophies?: UserTrophies | null;
}

const CATEGORIES = [
  { key: "history", label: "Histoire", ids: ["first_story", "five_stories", "ten_stories", "twenty_stories"] },
  { key: "character", label: "Personnages", ids: ["first_character", "five_characters", "ten_characters"] },
  { key: "votes", label: "Votes", ids: ["first_vote", "ten_votes", "fifty_votes"] },
  { key: "creation", label: "Créations", ids: ["first_creation", "five_creations", "popular_creator", "star_creator"] },
  { key: "level", label: "Niveau", ids: ["level_5", "level_10", "level_25", "level_50", "level_100"] },
  { key: "misc", label: "Divers", ids: ["night_owl"] },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10, rotate: -3 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 16 },
  },
};

export default function TabAchievements({ achievements, trophies }: TabAchievementsProps) {
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

  const total = achievements.achievements.length;
  const iconRegistry = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

  const trophiesBySeason = (trophies?.trophies ?? []).reduce<Record<string, Trophy[]>>(
    (acc, t) => {
      (acc[t.seasonName] ||= []).push(t);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-8">
      {trophies && trophies.total > 0 && (
        <div>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-yellow-400">
              {trophies.totalUnlocked}
              <span className="text-gray-500 text-2xl"> / {trophies.total}</span>
            </div>
            <div className="text-gray-400 text-sm">trophées de saison</div>
          </div>
          <div className="space-y-5">
            {Object.entries(trophiesBySeason).map(([seasonName, list]) => {
              const current = list.some((t) => t.fromCurrentSeason);
              return (
                <div key={seasonName}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                    {seasonName}
                    {current && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full normal-case">
                        Saison en cours
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {list.map((t) => {
                      const Icon = iconRegistry[t.icon] ?? LucideIcons.Award;
                      return (
                        <div
                          key={t.id}
                          className={`flex flex-col items-center p-5 rounded-xl border transition-colors duration-300 ${
                            t.unlocked
                              ? "bg-gradient-to-b from-yellow-500/15 to-yellow-500/5 border-yellow-500/30"
                              : "bg-gray-800/20 border-gray-700/20 opacity-60"
                          }`}
                        >
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${t.unlocked ? "bg-yellow-400/15" : "bg-gray-700/30"}`}>
                            <Icon className={`w-8 h-8 ${t.unlocked ? "text-yellow-400" : "text-gray-600"}`} />
                          </div>
                          <h4 className={`text-sm font-semibold text-center ${t.unlocked ? "text-white" : "text-gray-600"}`}>{t.title}</h4>
                          <p className={`text-xs text-center mt-1 ${t.unlocked ? "text-gray-400" : "text-gray-700"}`}>{t.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="text-3xl font-bold text-cyan-400">
          {achievements.totalUnlocked}
          <span className="text-gray-500 text-2xl"> / {total}</span>
        </div>
        <div className="text-gray-400 text-sm">succès débloqués</div>
      </div>

      {CATEGORIES.map((category) => {
        const catAchievements = achievements.achievements.filter((a) =>
          category.ids.includes(a.id)
        );
        if (catAchievements.length === 0) return null;

        return (
          <div key={category.key}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">
              {category.label}
            </h3>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {catAchievements.map((achievement) => {
                  const isUnlocked = achievement.unlocked;
                  const Icon = iconRegistry[achievement.icon] ?? LucideIcons.HelpCircle;

                  return (
                    <motion.div
                      key={achievement.id}
                      variants={cardVariants}
                      layout
                      className={`group relative flex flex-col items-center p-5 rounded-xl border transition-colors duration-300 ${
                        isUnlocked
                          ? "bg-gradient-to-b from-cyan-500/15 to-cyan-500/5 border-cyan-500/30"
                          : "bg-gray-800/20 border-gray-700/20 opacity-60"
                      }`}
                    >
                      <div
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                          isUnlocked
                            ? "bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            : "bg-gray-700/30"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 ${
                            isUnlocked ? "text-cyan-400" : "text-gray-600"
                          }`}
                        />

                        {isUnlocked && (
                          <motion.div
                            className="absolute inset-0 rounded-full border border-cyan-400/40"
                            animate={{
                              scale: [1, 1.08, 1],
                              opacity: [0.4, 0.8, 0.4],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </div>

                      <h4
                        className={`text-sm font-semibold text-center ${
                          isUnlocked ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      <p
                        className={`text-xs text-center mt-1 ${
                          isUnlocked ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        {achievement.description}
                      </p>

                      {isUnlocked && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 0, y: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
                        >
                          <span className="text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg">
                            Débloqué
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
