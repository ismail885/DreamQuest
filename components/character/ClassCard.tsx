'use client';

import React from 'react';
import Image from 'next/image';
import { ClassInfo, CLASS_ICONS, STAT_LABELS, STAT_COLORS, ABILITIES_DATA, CLASS_DIFFICULTIES, DIFFICULTY_LABELS, AbilityInfo } from '@/types';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface ClassCardProps {
 classInfo: ClassInfo;
 isSelected: boolean;
 onSelect: () => void;
}

const ClassCard = React.memo(function ClassCard({ classInfo, isSelected, onSelect }: ClassCardProps) {
 const ClassIcon = CLASS_ICONS[classInfo.name];
 const difficultyInfo = CLASS_DIFFICULTIES[classInfo.name];
 const difficultyMeta = DIFFICULTY_LABELS[difficultyInfo?.level ?? 'DEBUTANT'];
 
 // Récupérer les stats formatées avec leurs couleurs
 const stats = (Object.keys(classInfo.baseStats) as Array<keyof typeof classInfo.baseStats>).map((key) => ({
 key,
 label: STAT_LABELS[key],
 value: classInfo.baseStats[key],
 color: STAT_COLORS[key],
 }));

 // Récupérer les infos détaillées des capacités
 const abilitiesWithInfo = classInfo.abilities
 .map(name => ABILITIES_DATA[name])
 .filter(Boolean);

 const getAbilityTypeColor = (type: AbilityInfo['type']): string => {
 const colors: Record<string, string> = {
 OFFENSIVE: 'bg-red-500/20 text-red-300 border-red-500/40',
 DEFENSIVE: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
 SUPPORT: 'bg-green-500/20 text-green-300 border-green-500/40',
 UTILITY: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
 PASSIVE: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
 };
 return colors[type] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/40';
 };

 const getStatBarColor = (key: string): string => {
 const gradients: Record<string, string> = {
 force: 'from-orange-400 to-orange-500',
 agility: 'from-yellow-400 to-yellow-500',
 magie: 'from-purple-400 to-purple-500',
 endurance: 'from-red-400 to-red-500',
 };
 return gradients[key] ?? 'from-cyan-400 to-cyan-500';
 };

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.3 }}
 onClick={onSelect}
 className={`relative bg-[#0c1322]/80 border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
 isSelected 
 ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 scale-[1.02]' 
 : 'border-gray-800/50 hover:border-cyan-500/50'
 }`}
 >
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
 {/* Colonne gauche - Contenu */}
 <div className="md:col-span-2">
 {/* En-tête avec icône, rôle et difficulté */}
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
 <ClassIcon className="w-5 h-5 text-cyan-400" />
 </div>
 <div className="flex-1">
 <h3 className="text-3xl font-bold text-white ">
 {classInfo.name}
 </h3>
 <div className="flex items-center gap-2">
 <span className="text-cyan-400 text-sm">{classInfo.role}</span>
 <span className="text-gray-600">•</span>
 <span className={`text-xs font-medium ${difficultyMeta.color}`}>
 {difficultyMeta.label}
 </span>
 </div>
 </div>
 </div>
 
 <p className="text-gray-400 text-sm mb-4">
 {classInfo.description}
 </p>
 
 <div className="inline-block px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-500 mb-6">
 Mode: {classInfo.playstyle}
 </div>

 {/* Barres de statistiques */}
 <div className="space-y-3 mb-6">
 {stats.map((stat) => (
 <div key={stat.key} className="flex items-center gap-3">
 <span className={`w-5 h-5 ${stat.color}`}>
 {(() => {
 const Icon = classInfo.baseStats[stat.key] !== undefined 
 ? undefined 
 : undefined;
 return null;
 })()}
 </span>
 <span className={`text-sm w-20 ${stat.color}`}>{stat.label}</span>
 <div className="flex-1 bg-[#121827] rounded-full h-2 overflow-hidden">
 <div
 className={`h-full bg-gradient-to-r ${getStatBarColor(stat.key)} transition-all duration-500`}
 style={{ width: `${(stat.value / 10) * 100}%` }}
 />
 </div>
 <span className="font-medium text-sm w-10 text-right text-white ">
 {stat.value}/10
 </span>
 </div>
 ))}
 </div>

 {/* Capacités avec infobulles */}
 <div className="flex gap-2 flex-wrap">
 {abilitiesWithInfo.map((ability, index) => (
 <div key={ability.name} className="group relative">
 <span
 className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
 index === 0
 ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50'
 : 'bg-[#121827] text-gray-500 border-gray-700 '
 } group-hover:brightness-110 group-hover:scale-105`}
 >
 {ability.name}
 </span>
 
 {/* Tooltip */}
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-lg bg-gray-900 border border-gray-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
 {/* Type de capacité */}
 <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${getAbilityTypeColor(ability.type)}`}>
 {ability.type === 'OFFENSIVE' ? 'Offensive' :
 ability.type === 'DEFENSIVE' ? 'Défensive' :
 ability.type === 'SUPPORT' ? 'Soutien' :
 ability.type === 'UTILITY' ? 'Utilitaire' : 'Passive'}
 </span>
 
 {/* Description */}
 <p className="text-xs text-gray-300 leading-relaxed">
 {ability.description}
 </p>
 
 {/* Cooldown si applicable */}
 {ability.cooldown && ability.cooldown > 0 && (
 <p className="text-xs text-gray-500 mt-1">
 Recharge : {ability.cooldown} tours
 </p>
 )}
 
 {/* Flèche du tooltip */}
 <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 -mt-1" />
 </div>
 </div>
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
});

export default ClassCard;
