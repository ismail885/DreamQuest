"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface StatChange {
  [key: string]: number;
}

interface ChoiceButtonProps {
  text: string;
  statChanges?: StatChange;
  onClick: () => void;
}

export default function ChoiceButton({
  text,
  statChanges,
  onClick,
}: ChoiceButtonProps) {
  // Extract stat changes from statChanges object
  const statsArray = statChanges
    ? Object.entries(statChanges)
        .filter(([, value]) => value !== 0)
        .map(([stat, value]) => ({
          stat,
          value,
        }))
    : [];

  const hasNegative = statsArray.some((s) => s.value < 0);
  const hasPositive = statsArray.some((s) => s.value > 0);

  const getStatLabel = (stat: string): string => {
    const labels: Record<string, string> = {
      force: "Force",
      agility: "Agilité",
      magie: "Intelligence",
      endurance: "Endurance",
      points_vie: "PV",
    };
    return labels[stat] || stat;
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left px-6 py-4 bg-[#131e35]/50 border rounded-xl transition-all duration-200 flex flex-col gap-3 min-h-[80px] group ${
        hasNegative
          ? "hover:border-red-500/60 hover:bg-red-500/5 border-gray-700/60 hover:border-red-500/40"
          : hasPositive
            ? "hover:border-green-500/60 hover:bg-green-500/5 border-gray-700/60 hover:border-green-500/40"
            : "hover:border-cyan-500/60 hover:bg-cyan-500/5 border-gray-700/60 hover:border-cyan-500/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-gray-300 text-sm leading-relaxed flex-1 group-hover:text-white transition-colors">
          {text}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 group-hover:text-gray-400 transition-colors" />
      </div>

      {/* Stat consequence tags */}
      {statsArray.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statsArray.map(({ stat, value }) => (
            <span
              key={stat}
              className={`text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap ${
                value > 0
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {getStatLabel(stat)} {value > 0 ? "+" : ""}{value}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}
