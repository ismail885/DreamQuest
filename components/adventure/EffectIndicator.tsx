import type { ConsequenceEffect } from "@/types";

interface EffectIndicatorProps {
  lastConsequence: ConsequenceEffect | null;
  showEffect: boolean;
}

export default function EffectIndicator({
  lastConsequence,
  showEffect,
}: EffectIndicatorProps) {
  if (!showEffect || !lastConsequence) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gray-900 border border-cyan-500/50 rounded-xl px-4 py-3 shadow-lg shadow-cyan-500/20">
        <p className="text-cyan-400 text-sm font-semibold text-center mb-2">
          Impact du choix
        </p>
        <div className="flex gap-3 text-xs">
          {lastConsequence.pv_change !== undefined &&
            lastConsequence.pv_change !== 0 && (
              <span
                className={
                  lastConsequence.pv_change > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {lastConsequence.pv_change > 0 ? "+" : ""}
                {lastConsequence.pv_change} PV
              </span>
            )}
          {lastConsequence.force_change !== undefined &&
            lastConsequence.force_change !== 0 && (
              <span
                className={
                  lastConsequence.force_change > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {lastConsequence.force_change > 0 ? "+" : ""}
                {lastConsequence.force_change} Force
              </span>
            )}
          {lastConsequence.agility_change !== undefined &&
            lastConsequence.agility_change !== 0 && (
              <span
                className={
                  lastConsequence.agility_change > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {lastConsequence.agility_change > 0 ? "+" : ""}
                {lastConsequence.agility_change} Agilité
              </span>
            )}
          {lastConsequence.magie_change !== undefined &&
            lastConsequence.magie_change !== 0 && (
              <span
                className={
                  lastConsequence.magie_change > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {lastConsequence.magie_change > 0 ? "+" : ""}
                {lastConsequence.magie_change} Magie
              </span>
            )}
          {lastConsequence.endurance_change !== undefined &&
            lastConsequence.endurance_change !== 0 && (
              <span
                className={
                  lastConsequence.endurance_change > 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {lastConsequence.endurance_change > 0 ? "+" : ""}
                {lastConsequence.endurance_change} Endurance
              </span>
            )}
        </div>
        {lastConsequence.text && (
          <p className="text-gray-400 text-xs mt-2 text-center">
            {lastConsequence.text}
          </p>
        )}
      </div>
    </div>
  );
}
