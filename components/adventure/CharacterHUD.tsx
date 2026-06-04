import { memo } from "react";
import { Heart, Swords, Wind, Wand2, Shield, Zap, User } from "lucide-react";
import type { Character } from "@/types";
import { calculateRequiredXP } from "@/lib/characters/classDefinitions";

interface CharacterHUDProps {
  character: Character;
}

function classLabel(classe: string): string {
  const labels: Record<string, string> = {
    guerrier: "Guerrier", mage: "Mage", archer: "Archer",
    assassin: "Assassin", paladin: "Paladin", pretre: "Prêtre",
    druide: "Druide", necromancien: "Nécromancien", voleur: "Voleur", barbare: "Barbare",
  };
  return labels[classe?.toLowerCase()] || classe;
}

function CharacterHUD({ character }: CharacterHUDProps) {
  const xpCurrent = character.experience ?? 0;
  const xpNeeded = calculateRequiredXP(character.niveau);
  const xpRatio = Math.min(xpCurrent / Math.max(xpNeeded, 1), 1);
  const pvRatio = Math.min(character.points_vie / Math.max(character.points_vie_max ?? 100, 1), 1);
  const pvColor = pvRatio > 0.5 ? "from-red-500 to-red-400" : pvRatio > 0.25 ? "from-orange-500 to-orange-400" : "from-red-600 to-red-500";

  return (
    <div className="container mx-auto px-4 md:px-6 py-3">
      <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.15)] rounded-[10px]">
        {/* Row 1: Identity */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-white font-bold text-sm block truncate">{character.nom_personnage}</span>
              <span className="text-[10px] text-cyan-400">{classLabel(character.classe)} · Niv.{character.niveau}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">
              <Swords className="w-3 h-3" />{character.stats?.force ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
              <Wind className="w-3 h-3" />{character.stats?.agility ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
              <Wand2 className="w-3 h-3" />{character.stats?.magie ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
              <Shield className="w-3 h-3" />{character.stats?.endurance ?? 0}
            </span>
          </div>
        </div>

        {/* Row 2: PV + XP bars */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span className="text-gray-500 text-[10px] font-medium">PV</span>
              </div>
              <span className="text-white text-[11px] font-bold">{character.points_vie}/{character.points_vie_max ?? 100}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${pvColor} rounded-full transition-all duration-300`} style={{ width: `${pvRatio * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-500 text-[10px] font-medium">XP</span>
              </div>
              <span className="text-white text-[11px] font-bold">{xpCurrent}/{xpNeeded}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300" style={{ width: `${xpRatio * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CharacterHUD, (prev, next) => {
  return (
    prev.character.points_vie === next.character.points_vie &&
    prev.character.points_vie_max === next.character.points_vie_max &&
    prev.character.experience === next.character.experience &&
    prev.character.niveau === next.character.niveau &&
    prev.character.stats?.force === next.character.stats?.force &&
    prev.character.stats?.agility === next.character.stats?.agility &&
    prev.character.stats?.magie === next.character.stats?.magie &&
    prev.character.stats?.endurance === next.character.stats?.endurance
  );
});
