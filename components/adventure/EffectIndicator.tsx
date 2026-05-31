import { motion, AnimatePresence } from "framer-motion";
import { Heart, Swords, Wind, Wand2, Shield } from "lucide-react";
import type { ConsequenceEffect } from "@/types";

interface EffectIndicatorProps {
  lastConsequence: ConsequenceEffect | null;
  showEffect: boolean;
}

interface ChangeItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function EffectIndicator({
  lastConsequence,
  showEffect,
}: EffectIndicatorProps) {
  if (!showEffect || !lastConsequence) return null;

  const changes: ChangeItem[] = [];

  if (lastConsequence.pv_change !== undefined && lastConsequence.pv_change !== 0) {
    changes.push({
      label: "PV",
      value: lastConsequence.pv_change,
      icon: <Heart className="w-4 h-4" />,
      color: lastConsequence.pv_change > 0 ? "text-green-400" : "text-red-400",
    });
  }
  if (lastConsequence.force_change !== undefined && lastConsequence.force_change !== 0) {
    changes.push({
      label: "Force",
      value: lastConsequence.force_change,
      icon: <Swords className="w-4 h-4" />,
      color: lastConsequence.force_change > 0 ? "text-green-400" : "text-red-400",
    });
  }
  if (lastConsequence.agility_change !== undefined && lastConsequence.agility_change !== 0) {
    changes.push({
      label: "Agilité",
      value: lastConsequence.agility_change,
      icon: <Wind className="w-4 h-4" />,
      color: lastConsequence.agility_change > 0 ? "text-green-400" : "text-red-400",
    });
  }
  if (lastConsequence.magie_change !== undefined && lastConsequence.magie_change !== 0) {
    changes.push({
      label: "Magie",
      value: lastConsequence.magie_change,
      icon: <Wand2 className="w-4 h-4" />,
      color: lastConsequence.magie_change > 0 ? "text-green-400" : "text-red-400",
    });
  }
  if (lastConsequence.endurance_change !== undefined && lastConsequence.endurance_change !== 0) {
    changes.push({
      label: "Endurance",
      value: lastConsequence.endurance_change,
      icon: <Shield className="w-4 h-4" />,
      color: lastConsequence.endurance_change > 0 ? "text-green-400" : "text-red-400",
    });
  }

  if (changes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={lastConsequence.text || "effect"}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.9)] border border-cyan-500/30 rounded-xl px-5 py-4 shadow-xl shadow-cyan-500/10 min-w-[200px]">
          <p className="text-cyan-400 text-xs font-semibold mb-3 text-center uppercase tracking-wider">
            Conséquence
          </p>
          <div className="flex items-center justify-center gap-4">
            {changes.map((change) => (
              <div
                key={change.label}
                className="flex items-center gap-1.5"
              >
                <span className={change.color}>{change.icon}</span>
                <span className={`text-sm font-bold ${change.color}`}>
                  {change.value > 0 ? "+" : ""}
                  {change.value}
                </span>
              </div>
            ))}
          </div>
          {lastConsequence.text && (
            <p className="text-gray-500 text-xs text-center mt-3 leading-relaxed">
              {lastConsequence.text}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
