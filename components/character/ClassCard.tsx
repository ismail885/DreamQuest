'use client';

import Image from 'next/image';
import { ClassInfo } from '@/types';
import { Sword, Zap, Sparkles, Heart, Shield, Cross, Target, Leaf, User, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const CLASS_ICONS = {
  Paladin: Shield,
  Prêtre: Cross,
  Archer: Target,
  Druide: Leaf,
  Voleur: User,
  Barbare: Flame,
};

const STAT_ICONS = {
  force: Sword,
  agility: Zap,
  magie: Sparkles,
  endurance: Heart,
};

interface ClassCardProps {
  classInfo: ClassInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ClassCard({ classInfo, isSelected, onSelect }: ClassCardProps) {
  const ClassIcon = CLASS_ICONS[classInfo.name as keyof typeof CLASS_ICONS] || Shield;
  
  const stats = [
    { key: 'force' as const, label: 'Force', value: classInfo.baseStats.force, icon: STAT_ICONS.force, color: 'text-orange-400' },
    { key: 'agility' as const, label: 'Agilité', value: classInfo.baseStats.agility, icon: STAT_ICONS.agility, color: 'text-yellow-400' },
    { key: 'magie' as const, label: 'Magie', value: classInfo.baseStats.magie, icon: STAT_ICONS.magie, color: 'text-purple-400' },
    { key: 'endurance' as const, label: 'Endurance', value: classInfo.baseStats.endurance, icon: STAT_ICONS.endurance, color: 'text-red-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
      className={`relative bg-[#0f1623]/80 border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 scale-[1.02]' 
          : 'border-gray-800/50 hover:border-cyan-500/50'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Colonne gauche - Contenu */}
        <div className="md:col-span-2">
          {/* En-tête avec icône et rôle */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <ClassIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">
                {classInfo.name}
              </h3>
              <span className="text-cyan-400 text-sm">{classInfo.role}</span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">
            {classInfo.description}
          </p>
          
          <div className="inline-block px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-500 mb-6">
            Mode: {classInfo.playstyle}
          </div>

        <div className="space-y-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.key} className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-gray-400 text-sm w-20">{stat.label}</span>
              <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                  style={{ width: `${(stat.value / 10) * 100}%` }}
                />
              </div>
              <span className="text-cyan-400 font-medium text-sm w-10 text-right">
                {stat.value}/10
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {classInfo.abilities.map((ability, index) => (
            <span
              key={ability}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border ${
                index === 0
                  ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50'
                  : 'bg-[#1a1f2e] text-gray-500 border-gray-700'
              }`}
            >
              {ability}
            </span>
          ))}
        </div>
        </div>

        {/* Colonne droite - Image */}
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="relative w-40 h-64 md:w-48 md:h-80">
            <Image
              src={classInfo.image}
              alt={classInfo.name}
              fill
              sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 192px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
