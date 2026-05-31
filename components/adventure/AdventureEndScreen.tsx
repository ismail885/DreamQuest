"use client";

import { motion } from "framer-motion";
import { Zap, Swords, Wind, Wand2, Shield } from "lucide-react";

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

export default function AdventureEndScreen({
  historyLength,
  characterNiveau,
  xpGained,
  statsGained,
  combatStats,
  onRestart,
}: AdventureEndScreenProps) {
  const hasStatsGain = Object.values(statsGained).some((val) => val > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 space-y-4"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          <svg
            className="w-7 h-7 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-white font-bold text-xl">Aventure terminée !</p>
        <p className="text-gray-400 text-sm">
          Complétée en {historyLength} étape{historyLength > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="backdrop-blur-[8px] bg-[rgba(15,23,42,0.4)] border border-[rgba(6,182,212,0.1)] rounded-lg p-2">
          <p className="text-gray-400 text-xs">Combats gagnés</p>
          <p className="text-green-400 font-bold">{combatStats.wins}</p>
        </div>
        <div className="backdrop-blur-[8px] bg-[rgba(15,23,42,0.4)] border border-[rgba(6,182,212,0.1)] rounded-lg p-2">
          <p className="text-gray-400 text-xs">Combats perdus</p>
          <p className="text-red-400 font-bold">{combatStats.losses}</p>
        </div>
      </div>

      {xpGained > 0 && (
        <div className="backdrop-blur-[8px] bg-[rgba(15,23,42,0.4)] border border-yellow-500/20 rounded-lg p-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">
            XP gagnée: <span className="text-yellow-400 font-bold">{xpGained}</span>
          </span>
        </div>
      )}

      {hasStatsGain && (
        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-semibold px-1">Stats acquises :</p>
          <div className="grid grid-cols-4 gap-2">
            {statsGained.force > 0 && (
              <div className="backdrop-blur-[8px] bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center text-xs">
                <Swords className="w-3 h-3 text-orange-400 mx-auto mb-1" />
                <p className="text-gray-400">Force</p>
                <p className="text-orange-400 font-bold">+{statsGained.force}</p>
              </div>
            )}
            {statsGained.agility > 0 && (
              <div className="backdrop-blur-[8px] bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center text-xs">
                <Wind className="w-3 h-3 text-green-400 mx-auto mb-1" />
                <p className="text-gray-400">Agilité</p>
                <p className="text-green-400 font-bold">+{statsGained.agility}</p>
              </div>
            )}
            {statsGained.magie > 0 && (
              <div className="backdrop-blur-[8px] bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-center text-xs">
                <Wand2 className="w-3 h-3 text-purple-400 mx-auto mb-1" />
                <p className="text-gray-400">Magie</p>
                <p className="text-purple-400 font-bold">+{statsGained.magie}</p>
              </div>
            )}
            {statsGained.endurance > 0 && (
              <div className="backdrop-blur-[8px] bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-center text-xs">
                <Shield className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                <p className="text-gray-400">Endurance</p>
                <p className="text-blue-400 font-bold">+{statsGained.endurance}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {characterNiveau && characterNiveau > 1 && (
        <p className="text-yellow-400 font-semibold text-center text-sm">
          <Zap className="w-4 h-4 text-yellow-400 inline mr-1" />
          Niveau {characterNiveau} atteint !
        </p>
      )}

      <button
        onClick={onRestart}
        className="w-full px-8 py-3 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity mt-4"
      >
        Recommencer
      </button>
    </motion.div>
  );
}
