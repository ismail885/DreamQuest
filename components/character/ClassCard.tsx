'use client';

import Image from 'next/image';
import { ClassInfo } from '@/types';
import { Sword, Zap, Brain, Heart } from 'lucide-react';

interface ClassCardProps {
  classInfo: ClassInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ClassCard({ classInfo, onSelect }: ClassCardProps) {
  return (
    <div
      onClick={onSelect}
      className="relative bg-[#0f1623]/80 border border-gray-800/50 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-all"
    >
      <div className="relative h-72 w-full bg-gradient-to-b from-[#1a1f2e] to-[#0f1623]">
        <Image
          src={classInfo.image}
          alt={classInfo.name}
          fill
          className="object-contain"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      </div>

      <div className="px-6 pb-4 -mt-8 relative z-10">
        <h3 className="text-2xl font-bold text-white mb-2">
          {classInfo.name}
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          {classInfo.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Sword className="w-5 h-5 text-orange-400" />
            <span className="text-gray-400 text-sm w-24">Force</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.force / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-12 text-right">
              {classInfo.baseStats.force}/10
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400 text-sm w-24">Agilité</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.agilite / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-12 text-right">
              {classInfo.baseStats.agilite}/10
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm w-24">Intelligence</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.intelligence / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-12 text-right">
              {classInfo.baseStats.intelligence}/10
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-gray-400 text-sm w-24">Endurance</span>
            <div className="flex-1 bg-[#1a1f2e] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${(classInfo.baseStats.endurance / 10) * 100}%` }}
              />
            </div>
            <span className="text-cyan-400 font-medium text-sm w-12 text-right">
              {classInfo.baseStats.endurance}/10
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {classInfo.abilities.map((ability) => (
            <span
              key={ability}
              className="px-3 py-1.5 bg-[#1a1f2e] text-cyan-400 text-xs font-medium rounded-full border border-gray-700"
            >
              {ability}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
