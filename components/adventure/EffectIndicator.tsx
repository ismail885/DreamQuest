import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Swords,
  Wind,
  Wand2,
  Shield,
  ArrowUpCircle,
  ArrowDownCircle,
  Sparkles,
} from "lucide-react";
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

  const allZero =
    (lastConsequence.pv_change ?? 0) === 0 &&
    (lastConsequence.force_change ?? 0) === 0 &&
    (lastConsequence.agility_change ?? 0) === 0 &&
    (lastConsequence.magie_change ?? 0) === 0 &&
    (lastConsequence.endurance_change ?? 0) === 0;

  if (allZero && !lastConsequence.text) return null;

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

  const isPositive = changes.length > 0 && changes.every((c) => c.value > 0);
  const isNegative = changes.length > 0 && changes.every((c) => c.value < 0);
  const isMixed = changes.length > 0 && !isPositive && !isNegative;

  const borderColor = isNegative
    ? "border-red-500/40"
    : isPositive
      ? "border-green-500/40"
      : "border-amber-500/40";
  const shadowColor = isNegative
    ? "shadow-red-500/10"
    : isPositive
      ? "shadow-green-500/10"
      : "shadow-amber-500/10";

  return (
    <AnimatePresence>
      <motion.div
        key={lastConsequence.text || "effect"}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
      >
        <div
          className={`backdrop-blur-[10px] bg-[rgba(15,23,42,0.92)] border ${borderColor} rounded-xl px-6 py-4 shadow-xl ${shadowColor} min-w-[240px] max-w-[420px]`}
        >
          {/* Header dynamique */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {isNegative ? (
              <ArrowDownCircle className="w-4 h-4 text-red-400" />
            ) : isPositive ? (
              <ArrowUpCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400" />
            )}
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isNegative
                  ? "text-red-400"
                  : isPositive
                    ? "text-green-400"
                    : "text-amber-400"
              }`}
            >
              {isNegative
                ? "Perte"
                : isPositive
                  ? "Gain"
                  : "Conséquence"}
            </span>
          </div>

          {/* Stats changes */}
          {changes.length > 0 && (
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
          )}

          {/* Texte narratif — plus visible */}
          {lastConsequence.text && (
            <p
              className={`text-center mt-3 leading-relaxed ${
                changes.length > 0 ? "text-gray-400 text-xs" : "text-gray-300 text-sm"
              }`}
            >
              {lastConsequence.text}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
