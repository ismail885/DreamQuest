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

  const getBorderClass = () => {
    if (hasNegative) {
      return "border-[rgba(6,182,212,0.2)] hover:border-red-500/50 hover:bg-red-500/5";
    }
    if (hasPositive) {
      return "border-[rgba(6,182,212,0.2)] hover:border-green-500/50 hover:bg-green-500/5";
    }
    return "border-[rgba(6,182,212,0.2)] hover:border-[rgba(6,182,212,0.5)] hover:bg-[rgba(6,182,212,0.05)]";
  };

  return (
    <motion.button
      whileHover={{
        y: -2,
        transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] as const },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left px-6 py-4 backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border ${getBorderClass()} rounded-[10px] transition-all duration-300 ease-out flex flex-col gap-3 min-h-[80px] group shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-gray-300 text-sm leading-relaxed flex-1 group-hover:text-white transition-colors duration-300">
          {text}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 ease-out" />
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
              {getStatLabel(stat)} {value > 0 ? "+" : ""}
              {value}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}
