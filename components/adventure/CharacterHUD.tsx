import { Heart, Swords, Brain } from "lucide-react";
import type { Character } from "@/types";

interface CharacterHUDProps {
  character: Character;
}

export default function CharacterHUD({ character }: CharacterHUDProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800/40">
      <div className="flex items-center gap-3 flex-1 bg-[#131e35] border border-gray-800/60 rounded-xl px-4 py-3">
        <Heart className="w-6 h-6 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-gray-400 text-xs">Santé</p>
          <p className="text-white font-bold text-lg leading-none">
            {character.points_vie}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 bg-[#131e35] border border-gray-800/60 rounded-xl px-4 py-3">
        <Swords className="w-6 h-6 text-orange-400 flex-shrink-0" />
        <div>
          <p className="text-gray-400 text-xs">Force</p>
          <p className="text-white font-bold text-lg leading-none">
            {character.stats?.force ?? 0}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 bg-[#131e35] border border-gray-800/60 rounded-xl px-4 py-3">
        <Brain className="w-6 h-6 text-purple-400 flex-shrink-0" />
        <div>
          <p className="text-gray-400 text-xs">Intelligence</p>
          <p className="text-white font-bold text-lg leading-none">
            {character.stats?.magie ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
