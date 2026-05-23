"use client";

import { useRouter } from "next/navigation";
import type { Character } from "@/types";
import { getTotalXPForLevel, calculateRequiredXP } from "@/types";

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
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/create-character")}
          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Personnage
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char, index) => {
          const niveau = char.niveau || 1;
          const totalXp = char.experience ?? 0;
          const xpAtLevelStart = niveau > 1 ? getTotalXPForLevel(niveau) : 0;
          const xpInCurrentLevel = Math.max(0, totalXp - xpAtLevelStart);
          const xpForNextLevel = calculateRequiredXP(niveau);
          const xpPercent = xpForNextLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 0;
          const passif = PASSIFS[char.classe as string];

          return (
            <div
              key={char.id ?? index}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-cyan-400 rounded-lg overflow-hidden transition-all duration-300 group"
            >
              <div className="relative h-32 bg-gradient-to-b from-gray-800 to-gray-900">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                <div className="absolute top-2 right-2">
                  <span className="bg-cyan-500 text-gray-900 rounded-full px-3 py-1 font-bold text-sm">
                    Niv. {niveau}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>XP</span>
                    <span>{Math.floor(xpInCurrentLevel)}/{xpForNextLevel}</span>
                  </div>
                  <div className="h-1 bg-gray-900/80 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${xpPercent}%` }} />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-1">{char.nom_personnage}</h3>
                <p className="text-cyan-400 text-sm mb-2">{char.classe}</p>
                {passif && (
                  <div className="mb-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <span className="text-cyan-400 text-xs font-medium">{passif.name}</span>
                    <span className="text-xs text-gray-400 block">{passif.desc}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{char.points_vie || 100} PV</span>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => router.push(`/adventure?personnage=${char.id}`)}
                  className="flex-1 py-2 px-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium text-center"
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
