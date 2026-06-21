import { memo } from "react";
import Image from "next/image";
import { Heart, Swords, Wind, Wand2, Shield, Zap, ChevronDown, ChevronUp } from "lucide-react";
import type { Character } from "@/types";
import { getXPInCurrentLevel, getXPForNextLevel } from "@/lib/leveling";

interface CharacterHUDProps {
  character: Character;
  fatigueCount?: number;
  maxFatigue?: number;
  isFatigued?: boolean;
  /** Mode sidebar (desktop) ou compact (mobile) */
  sidebar?: boolean;
}

const CLASS_IMAGES: Record<string, string> = {
  guerrier: "/illustrations_personnage/guerrier.jpg",
  mage: "/illustrations_personnage/mage.jpg",
  archer: "/illustrations_personnage/archer.jpg",
  assassin: "/illustrations_personnage/assassin.jpg",
  paladin: "/illustrations_personnage/paladin.jpeg",
  pretre: "/illustrations_personnage/prêtre.jpeg",
  druide: "/illustrations_personnage/druide.jpg",
  necromancien: "/illustrations_personnage/necromancien.jpg",
  voleur: "/illustrations_personnage/voleur.jpg",
  barbare: "/illustrations_personnage/barbare.jpg",
};

function normalizeClass(classe: string): string {
  return (classe ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function getCharacterImage(classe: string): string {
  return CLASS_IMAGES[normalizeClass(classe)] ?? "/illustrations_personnage/guerrier.jpg";
}

function classLabel(classe: string): string {
  const labels: Record<string, string> = {
    guerrier: "Guerrier", mage: "Mage", archer: "Archer",
    assassin: "Assassin", paladin: "Paladin", pretre: "Prêtre",
    druide: "Druide", necromancien: "Nécromancien", voleur: "Voleur", barbare: "Barbare",
  };
  return labels[normalizeClass(classe)] || classe;
}

function CharacterHUD({ character, fatigueCount = 0, maxFatigue = 10, isFatigued = false, sidebar = false }: CharacterHUDProps) {
  const xpCurrent = getXPInCurrentLevel(character.niveau, character.experience ?? 0);
  const xpNeeded = getXPForNextLevel(character.niveau);
  const xpRatio = Math.min(xpCurrent / Math.max(xpNeeded, 1), 1);
  const pvRatio = Math.min(character.points_vie / Math.max(character.points_vie_max ?? 100, 1), 1);
  const pvColor = pvRatio > 0.5 ? "from-red-500 to-red-400" : pvRatio > 0.25 ? "from-orange-500 to-orange-400" : "from-red-600 to-red-500";

  if (sidebar) {
    return (
      <div className="space-y-4">
        {/* Identité */}
        <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-cyan-500/15">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <Image
              src={getCharacterImage(character.classe)}
              alt={character.classe}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{character.nom_personnage}</p>
            <p className="text-[11px] text-cyan-400">{classLabel(character.classe)} · Niveau {character.niveau}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 px-2.5 py-1.5 rounded-lg">
            <Swords className="w-3.5 h-3.5" /><span>{character.stats?.force ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded-lg">
            <Wind className="w-3.5 h-3.5" /><span>{character.stats?.agility ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-2.5 py-1.5 rounded-lg">
            <Wand2 className="w-3.5 h-3.5" /><span>{character.stats?.magie ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1.5 rounded-lg">
            <Shield className="w-3.5 h-3.5" /><span>{character.stats?.endurance ?? 0}</span>
          </div>
        </div>

        {/* PV */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Heart className="w-3 h-3 text-red-400" /> PV
            </span>
            <span className="text-white text-xs font-bold">{character.points_vie}/{character.points_vie_max ?? 100}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${pvColor} rounded-full transition-all duration-300`} style={{ width: `${pvRatio * 100}%` }} />
          </div>
        </div>

        {/* XP */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Zap className="w-3 h-3 text-yellow-400" /> XP
            </span>
            <span className="text-white text-xs font-bold">{xpCurrent}/{xpNeeded}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300" style={{ width: `${xpRatio * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // Mode compact mobile : affichage minimal avec toggle
  return (
    <div className="container mx-auto px-4">
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer list-none backdrop-blur-card bg-slate-900/60 border border-cyan-500/15 rounded-card px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-cyan-500/30 flex-shrink-0">
              <Image
                src={getCharacterImage(character.classe)}
                alt={character.classe}
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-white font-semibold text-xs block truncate">{character.nom_personnage}</span>
              <span className="text-[10px] text-cyan-400">{classLabel(character.classe)} · Niv.{character.niveau}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-white font-medium">{character.points_vie}</span>
              <span className="text-gray-500">/ {character.points_vie_max ?? 100}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-open:hidden" />
            <ChevronUp className="w-4 h-4 text-gray-400 hidden group-open:block" />
          </div>
        </summary>

        <div className="backdrop-blur-card bg-slate-900/60 border border-cyan-500/15 border-t-0 rounded-b-card px-4 pb-4 pt-3 space-y-3">
          {/* Stats */}
          <div className="flex items-center gap-3 flex-wrap">
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

          {/* XP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <Zap className="w-2.5 h-2.5 text-yellow-400" />XP
              </span>
              <span className="text-white text-[10px] font-bold">{xpCurrent}/{xpNeeded}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300" style={{ width: `${xpRatio * 100}%` }} />
            </div>
          </div>
        </div>
      </details>
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
    prev.character.stats?.endurance === next.character.stats?.endurance &&
    prev.fatigueCount === next.fatigueCount &&
    prev.isFatigued === next.isFatigued
  );
});
