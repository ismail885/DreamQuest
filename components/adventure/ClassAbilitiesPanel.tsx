"use client";

import { Sparkles } from "lucide-react";
import type { Character } from "@/types";

interface ClassAbilitiesPanelProps {
  character: Character;
  availableAbilities: string[];
  usedAbilities: string[];
  onUseAbility: (ability: string) => void;
}

export default function ClassAbilitiesPanel({
  character,
  availableAbilities,
  usedAbilities,
  onUseAbility,
}: ClassAbilitiesPanelProps) {
  if (availableAbilities.length === 0 || !character?.classe) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[rgba(6,182,212,0.15)]">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <p className="text-purple-400 text-xs font-semibold">
          COMPÉTENCE {character.classe.toUpperCase()}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {availableAbilities.map((ability) => (
          <button
            key={ability}
            disabled={usedAbilities.includes(ability)}
            onClick={() => onUseAbility(ability)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
              usedAbilities.includes(ability)
                ? "bg-gray-800/50 border border-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
                : "bg-transparent border border-[rgba(6,182,212,0.2)] hover:border-[#06b6d4]/50 text-gray-400 hover:text-white"
            }`}
          >
            <span className="font-medium">{ability}</span>
            {!usedAbilities.includes(ability) && (
              <span className="text-gray-400 ml-2">(1 rest) • +10 PV</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
