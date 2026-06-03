"use client";

import { useRouter } from "next/navigation";
import type { Character } from "@/types";
import { getTotalXPForLevel, calculateRequiredXP } from "@/types";
import {
  Swords, Sparkles, Wind, Cross, Shield, Target, Leaf, Skull, User, Flame,
} from "lucide-react";

interface TabCharactersProps {
  characters: Character[];
}

const PASSIFS: Record<string, { name: string; desc: string }> = {
  Guerrier: { name: "Force du Combattant", desc: "+10% dégâts physiques" },
  Mage: { name: "Arcane Résistant", desc: "+10% résistance magique" },
  Assassin: { name: "Coup Fatal", desc: "+15% critique" },
  Prêtre: { name: "Foi Guérisseuse", desc: "+5% soins reçus" },
  Paladin: { name: "Bouclier Sacré", desc: "+5% PV max" },
  Archer: { name: "Œil de Lynx", desc: "+10% précision" },
  Druide: { name: "Force de la Nature", desc: "+10% régénération" },
  Nécromancien: { name: "Lien Sombre", desc: "+5% vol de vie" },
  Voleur: { name: "Ombre Fugitive", desc: "+10% esquive" },
  Barbare: { name: "Furie Sauvage", desc: "+10% force brute" },
};

const CLASS_GRADIENTS: Record<string, string> = {
  Guerrier: "from-red-600 to-orange-700",
  Mage: "from-purple-600 to-indigo-700",
  Assassin: "from-gray-600 to-slate-800",
  Prêtre: "from-yellow-500 to-amber-700",
  Paladin: "from-blue-600 to-cyan-700",
  Archer: "from-green-600 to-emerald-700",
  Druide: "from-lime-600 to-green-800",
  Nécromancien: "from-violet-800 to-fuchsia-900",
  Voleur: "from-stone-600 to-zinc-800",
  Barbare: "from-orange-600 to-red-800",
};

const ICON_MAP: Record<string, typeof Swords> = {
  Guerrier: Swords,
  Mage: Sparkles,
  Assassin: Wind,
  Prêtre: Cross,
  Paladin: Shield,
  Archer: Target,
  Druide: Leaf,
  Nécromancien: Skull,
  Voleur: User,
  Barbare: Flame,
};

export default function TabCharacters({ characters }: TabCharactersProps) {
  const router = useRouter();

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucun personnage</h3>
        <p className="text-gray-400 mb-4">Créez votre premier personnage pour commencer l&apos;aventure.</p>
        <button
          onClick={() => router.push("/create-character")}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
        >
          Créer un personnage
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-gray-400 text-sm">{characters.length} personnage{characters.length > 1 ? "s" : ""}</p>
        <button
          onClick={() => router.push("/create-character")}
          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {characters.map((char, index) => {
          const niveau = char.niveau || 1;
          const totalXp = char.experience ?? 0;
          const xpAtLevelStart = niveau > 1 ? getTotalXPForLevel(niveau) : 0;
          const xpInCurrentLevel = Math.max(0, totalXp - xpAtLevelStart);
          const xpForNextLevel = calculateRequiredXP(niveau);
          const xpPercent = xpForNextLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 0;
          const passif = PASSIFS[char.classe as string];
          const gradient = CLASS_GRADIENTS[char.classe as string] || "from-gray-600 to-gray-800";
          const Icon = ICON_MAP[char.classe as string] || User;

          return (
            <div
              key={char.id ?? index}
              className="bg-surface border border-gray-700/40 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center pt-6 pb-4 px-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-3 ring-2 ring-white/10`}>
                  <Icon className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white text-center leading-tight">{char.nom_personnage}</h3>
                <p className="text-cyan-400 text-sm font-medium">{char.classe}</p>
                <span className="mt-2 px-3 py-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full text-xs text-cyan-300 font-semibold">
                  Niveau {niveau}
                </span>
              </div>

              <div className="px-4 pb-4 space-y-3">
                {passif && (
                  <div className="p-2.5 bg-gray-800/50 rounded-lg border border-gray-700/30">
                    <p className="text-cyan-300 text-xs font-semibold">{passif.name}</p>
                    <p className="text-gray-400 text-xs">{passif.desc}</p>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    {char.points_vie || 100} PV
                  </span>
                  <span>{Math.floor(xpInCurrentLevel)} / {xpForNextLevel} XP</span>
                </div>

                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>

                <button
                  onClick={() => router.push(`/adventure?personnage=${char.id}`)}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all text-sm font-semibold"
                >
                  Jouer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
