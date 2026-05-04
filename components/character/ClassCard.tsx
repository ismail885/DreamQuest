'use client';

import Image from 'next/image';
import { ClassInfo } from '@/types';
import { Sword, Zap, Brain, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClassCardProps {
  classInfo: ClassInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ClassCard({ classInfo, isSelected, onSelect }: ClassCardProps) {
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
          <h3 className="text-3xl font-bold text-white mb-2">
            {classInfo.name}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {classInfo.description}
          </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Sword className="w-5 h-5 text-orange-400" />
            <span className="text-gray-400 text-sm w-20">Force</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.force / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-10 text-right">
              {classInfo.baseStats.force}/10
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400 text-sm w-20">Agilité</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.agility / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-10 text-right">
              {classInfo.baseStats.agility}/10
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm w-20">Intelligence</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.intelligence / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-10 text-right">
              {classInfo.baseStats.intelligence}/10
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-gray-400 text-sm w-20">Endurance</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.endurance / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-10 text-right">
              {classInfo.baseStats.endurance}/10
            </span>
          </div>
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
              {index === 0 && ' (Nv.1)'}
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
