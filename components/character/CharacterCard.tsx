import React from 'react';
import { Character, CHARACTER_CLASSES, STAT_ICONS, CLASS_PASSIVES, getTotalXPForLevel, calculateRequiredXP } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface CharacterCardProps {
  character: Character;
  onSelect?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

export default function CharacterCard({ character, onSelect, onDelete, isSelected }: CharacterCardProps) {
  const classInfo = CHARACTER_CLASSES[character.classe];
  const passif = CLASS_PASSIVES[character.classe as keyof typeof CLASS_PASSIVES];
  const pv = character.points_vie ?? 0;
  const pvMax = character.points_vie_max ?? 100;
  const healthPercentage = pvMax > 0 ? (pv / pvMax) * 100 : 0;
  
  const niveau = character.niveau || 1;
  const totalXp = character.experience ?? 0;
  const xpAtLevelStart = niveau > 1 ? getTotalXPForLevel(niveau) : 0;
  const xpInCurrentLevel = Math.max(0, totalXp - xpAtLevelStart);
  const xpForNextLevel = calculateRequiredXP(niveau);
  const xpPercent = xpForNextLevel > 0 ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`bg-gray-900/50 backdrop-blur-sm border rounded-lg overflow-hidden transition-all duration-300 group ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-gray-800 hover:border-cyan-400'}`}
    >
      <div className="relative h-48 bg-gradient-to-b from-gray-800 to-gray-900">
        <Image
          src={classInfo?.image ?? '/illustrations_personnage/default.png'}
          alt={character.nom_personnage}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {isSelected && (
            <span className="bg-cyan-500 text-gray-900 rounded-full px-3 py-1 font-bold text-sm">
              ✓Sélectionné
            </span>
          )}
          <span className="bg-cyan-500 text-gray-900 rounded-full px-3 py-1 font-bold">
            Niv. {character.niveau}
          </span>
        </div>
        
        {/* Barre XP */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>XP</span>
            <span>{Math.floor(xpInCurrentLevel)} / {xpForNextLevel}</span>
          </div>
          <div className="h-1.5 bg-gray-900/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-1">{character.nom_personnage}</h3>
        <p className="text-cyan-400 text-sm mb-3">{character.classe}</p>

        {/* Passif de la classe */}
        {passif && (
          <div className="mb-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs font-medium">{passif.name}</span>
            </div>
            <span className="text-xs text-gray-400">{passif.description}</span>
          </div>
        )}

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Points de Vie</span>
            <span>{pv} / {pvMax}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                healthPercentage > 50
                  ? 'bg-green-500'
                  : healthPercentage > 25
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(character.stats ?? {}).map(([stat, value]) => (
            <div key={stat} className="flex items-center gap-2 text-sm">
              <span className="text-xl">{React.createElement(STAT_ICONS[stat as keyof typeof STAT_ICONS], { className: "w-5 h-5" })}</span>
              <span className="text-gray-400 capitalize">{stat}:</span>
              <span className="text-white font-bold">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {onSelect && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSelect}
              className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
            >
              {isSelected ? '▶ Jouez' : 'Sélectionner'}
            </motion.button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
              title="Supprimer le personnage"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
