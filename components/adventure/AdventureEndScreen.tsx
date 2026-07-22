"use client";

"use client";

import { motion } from "framer-motion";
import { Zap, Swords, Wind, Wand2, Shield, Trophy, RotateCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface AdventureEndScreenProps {
  historyLength: number;
  characterNiveau?: number;
  xpGained: number;
  statsGained: {
    force: number;
    agility: number;
    magie: number;
    endurance: number;
  };
  combatStats: { wins: number; losses: number };
  onRestart: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function AdventureEndScreen({
  historyLength,
  characterNiveau,
  xpGained,
  statsGained,
  combatStats,
  onRestart,
}: AdventureEndScreenProps) {
  const { t } = useLanguage();
  const hasStatsGain = Object.values(statsGained).some((val) => val > 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="card-base p-6 space-y-4"
    >
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30"
        >
          <Trophy className="w-7 h-7 text-cyan-400" />
        </motion.div>
        <p className="text-white font-bold text-xl">{t("adventure.endScreen.title")}</p>
        <p className="text-gray-300 text-sm">
          {t("adventure.endScreen.completedIn")} {historyLength} {t("adventure.endScreen.steps")}{historyLength > 1 ? "s" : ""}
        </p>
        {/* Note: plural "s" works for both fr (étape→étapes) and en (step→steps) */}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="backdrop-blur-sm bg-slate-900/40 border border-cyan-500/10 rounded-lg p-2">
          <p className="text-gray-300 text-xs">{t("adventure.endScreen.battlesWon")}</p>
          <p className="text-green-400 font-bold text-lg">{combatStats.wins}</p>
        </div>
        <div className="backdrop-blur-sm bg-slate-900/40 border border-cyan-500/10 rounded-lg p-2">
          <p className="text-gray-300 text-xs">{t("adventure.endScreen.battlesLost")}</p>
          <p className="text-red-400 font-bold text-lg">{combatStats.losses}</p>
        </div>
      </motion.div>

      {xpGained > 0 && (
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-sm bg-slate-900/40 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-2"
        >
          <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">
            {t("adventure.endScreen.xpGained")}: <span className="text-yellow-400 font-bold">+{xpGained}</span>
          </span>
        </motion.div>
      )}

      {hasStatsGain && (
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-gray-300 text-xs font-semibold px-1">{t("adventure.endScreen.statsAcquired")}</p>
          <div className="grid grid-cols-4 gap-2">
            {statsGained.force > 0 && (
              <div className="backdrop-blur-sm bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center text-xs">
                <Swords className="w-3 h-3 text-orange-400 mx-auto mb-1" />
                <p className="text-gray-300">{t("character.statsLabels.force")}</p>
                <p className="text-orange-400 font-bold">+{statsGained.force}</p>
              </div>
            )}
            {statsGained.agility > 0 && (
              <div className="backdrop-blur-sm bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center text-xs">
                <Wind className="w-3 h-3 text-green-400 mx-auto mb-1" />
                <p className="text-gray-300">{t("character.statsLabels.agility")}</p>
                <p className="text-green-400 font-bold">+{statsGained.agility}</p>
              </div>
            )}
            {statsGained.magie > 0 && (
              <div className="backdrop-blur-sm bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-center text-xs">
                <Wand2 className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                <p className="text-gray-300">{t("character.statsLabels.magie")}</p>
                <p className="text-purple-400 font-bold">+{statsGained.magie}</p>
              </div>
            )}
            {statsGained.endurance > 0 && (
              <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-center text-xs">
                <Shield className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                <p className="text-gray-300">{t("character.statsLabels.endurance")}</p>
                <p className="text-blue-400 font-bold">+{statsGained.endurance}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {characterNiveau && characterNiveau > 1 && (
        <motion.p
          variants={itemVariants}
          className="text-yellow-400 font-semibold text-center text-sm"
        >
          <Zap className="w-4 h-4 text-yellow-400 inline mr-1" />
          {t("adventure.endScreen.levelReached").replace("{level}", String(characterNiveau))}
        </motion.p>
      )}

      <motion.button
        variants={itemVariants}
        onClick={onRestart}
        className="group w-full px-8 py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-card font-semibold transition-all duration-300 ease-out hover:scale-102 active:scale-98 hover:shadow-[0px_10px_25px_-3px_rgba(6,182,212,0.5)] mt-4 flex items-center justify-center gap-2"
      >
        <RotateCw className="w-4 h-4 transition-transform duration-300 ease-out group-hover:rotate-180" />
        {t("adventure.restart")}
      </motion.button>
    </motion.div>
  );
}







