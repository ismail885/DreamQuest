import { Heart, Swords, Wand2 } from "lucide-react";
import type { Character } from "@/types";

interface CharacterHUDProps {
  character: Character;
}

export default function CharacterHUD({ character }: CharacterHUDProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 md:px-6 py-4">
      {/* Santé */}
      <div className="flex-1 min-w-0 flex items-center gap-3 bg-[#131e35]/80 border border-cyan-500/30 rounded-xl px-4 py-3 hover:border-cyan-500/50 transition-colors">
        <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-gray-400 text-xs md:text-sm">Santé</p>
          <p className="text-white font-bold text-lg md:text-xl leading-none">
            {character.points_vie}
          </p>
        </div>
      </div>

      {/* Force */}
      <div className="flex-1 min-w-0 flex items-center gap-3 bg-[#131e35]/80 border border-cyan-500/30 rounded-xl px-4 py-3 hover:border-cyan-500/50 transition-colors">
        <Swords className="w-5 h-5 md:w-6 md:h-6 text-orange-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-gray-400 text-xs md:text-sm">Force</p>
          <p className="text-white font-bold text-lg md:text-xl leading-none">
            {character.stats?.force ?? 0}
          </p>
        </div>
      </div>

      {/* Intelligence */}
      <div className="flex-1 min-w-0 flex items-center gap-3 bg-[#131e35]/80 border border-cyan-500/30 rounded-xl px-4 py-3 hover:border-cyan-500/50 transition-colors">
        <Wand2 className="w-5 h-5 md:w-6 md:h-6 text-purple-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-gray-400 text-xs md:text-sm">Intelligence</p>
          <p className="text-white font-bold text-lg md:text-xl leading-none">
            {character.stats?.magie ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
