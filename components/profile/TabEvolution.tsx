"use client";

import * as LucideIcons from "lucide-react";
import type { Character } from "@/types";
import { getTotalXPForLevel, calculateRequiredXP } from "@/types";

interface TabEvolutionProps {
  characters: Character[];
}

const PASSIFS: Record<string, { name: string; desc: string; icon: string }> = {
  Guerrier: { name: "Force du Combattant", desc: "+10% dégâts physiques", icon: "Swords" },
  Mage: { name: "Arcane Résistant", desc: "+10% résistance magique", icon: "Sparkles" },
  Assassin: { name: "Coup Fatal", desc: "+15% critique", icon: "Knife" },
  Prêtre: { name: "Foi Guérisseuse", desc: "+5% soins reçus", icon: "Star" },
  Paladin: { name: "Bouclier Sacré", desc: "+5% PV max", icon: "Shield" },
  Archer: { name: "Œil de Lynx", desc: "+10% précision", icon: "Crosshair" },
  Druide: { name: "Force de la Nature", desc: "+10% régénération", icon: "Leaf" },
  Nécromancien: { name: "Lien Sombre", desc: "+5% vol de vie", icon: "Skull" },
  Voleur: { name: "Ombre Fugitive", desc: "+10% esquive", icon: "User" },
  Barbare: { name: "Furie Sauvage", desc: "+10% force brute", icon: "Flame" },
};

export default function TabEvolution({ characters }: TabEvolutionProps) {
  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucun personnage</h3>
        <p className="text-gray-400 mb-4">Créez votre premier personnage pour voir son évolution.</p>
        <button
          onClick={() => window.location.href = "/create-character"}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
        >
          Créer un personnage
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {characters.map((char, index) => {
        const niveau = char.niveau || 1;
        const totalXp = char.experience ?? 0;
        const xpAtLevelStart = niveau > 1 ? getTotalXPForLevel(niveau) : 0;
        const xpInCurrentLevel = Math.max(0, totalXp - xpAtLevelStart);
        const xpForNextLevel = calculateRequiredXP(niveau);
        const xpPercent = xpForNextLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 0;
        const passif = PASSIFS[char.classe as string];
        const stats = char.stats || { force: 0, agility: 0, magie: 0, endurance: 0 };
        const maxStat = Math.max(stats.force, stats.agility, stats.magie, stats.endurance);

        return (
          <div key={char.id ?? index} className="bg-[#0c1322] border border-gray-700/30 rounded-xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                {char.nom_personnage.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{char.nom_personnage}</h3>
                <p className="text-cyan-400 text-sm">Niveau {niveau} - {char.classe}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Experience</span>
                <span className="text-cyan-400">{Math.floor(xpInCurrentLevel)} / {xpForNextLevel} XP</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {Object.entries(stats).map(([stat, value]) => {
                const percent = maxStat > 0 ? (value / maxStat) * 100 : 0;
                return (
                  <div key={stat} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 capitalize">{stat}</span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {passif && (() => {
              const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[passif.icon];
              return (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {IconComponent && <IconComponent className="w-5 h-5 text-cyan-400" />}
                    <span className="text-cyan-400 font-medium">{passif.name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{passif.desc}</span>
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
