import { Heart, Swords, Wand2, Wind, Shield, Zap, User } from "lucide-react";
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

export default function CharacterHUD({ character }: CharacterHUDProps) {
  const xpCurrent = character.experience ?? 0;
  const xpNeeded = calculateRequiredXP(character.niveau);
  const xpRatio = Math.min(xpCurrent / Math.max(xpNeeded, 1), 1);
  const pvRatio = Math.min(character.points_vie / Math.max(character.points_vie_max ?? 100, 1), 1);

  return (
    <div className="px-4 md:px-6 py-4 space-y-3">
      <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">{character.nom_personnage}</span>
            <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{classLabel(character.classe)}</span>
            <span className="text-xs text-gray-400">Niv. {character.niveau}</span>
          </div>
          <User className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-gray-400 text-xs">PV</span>
              </div>
              <span className="text-white text-xs font-bold">{character.points_vie}/{character.points_vie_max ?? 100}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300" style={{ width: `${pvRatio * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-xs">XP</span>
              </div>
              <span className="text-white text-xs font-bold">{xpCurrent}/{xpNeeded}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300" style={{ width: `${xpRatio * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="text-center">
            <Swords className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">Force</p>
            <p className="text-white font-bold text-sm">{character.stats?.force ?? 0}</p>
          </div>
          <div className="text-center">
            <Wind className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">Agilité</p>
            <p className="text-white font-bold text-sm">{character.stats?.agility ?? 0}</p>
          </div>
          <div className="text-center">
            <Wand2 className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">Magie</p>
            <p className="text-white font-bold text-sm">{character.stats?.magie ?? 0}</p>
          </div>
          <div className="text-center">
            <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">Endurance</p>
            <p className="text-white font-bold text-sm">{character.stats?.endurance ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
