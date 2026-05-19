'use client';

import { useState, useMemo } from 'react';
import { 
 CHARACTER_CLASSES, CharacterClass, Character, 
 validateCharacterName, CLASS_DIFFICULTIES, ABILITIES_DATA,
} from '@/types';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { 
 Check, AlertCircle, ChevronLeft, ChevronRight, 
 Swords, Zap, Brain, Heart,
 Shield, Star, TrendingUp,
} from 'lucide-react';
import Image from 'next/image';

interface CreateCharacterFormProps {
 userId?: number;
 onCharacterCreated?: (character: Character) => void;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: typeof Shield }> = {
 DEBUTANT: { 
 label: 'Débutant', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/30',
 Icon: Shield,
 },
 INTERMEDIAIRE: { 
 label: 'Intermédiaire', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30',
 Icon: Star,
 },
 EXPERT: { 
 label: 'Expert', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/30',
 Icon: TrendingUp,
 },
};

const ABILITY_BADGES: Record<string, { label: string; color: string; border: string }> = {
 OFFENSIVE: { label: 'Offensive', color: 'text-red-300', border: 'border-red-500/40' },
 DEFENSIVE: { label: 'Défensive', color: 'text-blue-300', border: 'border-blue-500/40' },
 SUPPORT: { label: 'Soutien', color: 'text-green-300', border: 'border-green-500/40' },
 UTILITY: { label: 'Utilitaire', color: 'text-purple-300', border: 'border-purple-500/40' },
 PASSIVE: { label: 'Passive', color: 'text-gray-300', border: 'border-gray-500/40' },
};

export default function CreateCharacterForm({ userId, onCharacterCreated }: CreateCharacterFormProps) {
 const [currentStep, setCurrentStep] = useState(0);
 const [characterName, setCharacterName] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');
 const [nameError, setNameError] = useState('');

 const classes = useMemo(() => Object.values(CHARACTER_CLASSES), []);
 const currentClass = classes[currentStep];
 const classType = currentClass.name as CharacterClass;
 const classInfo = CHARACTER_CLASSES[classType];
 const diffInfo = CLASS_DIFFICULTIES[classType];
 const diffCfg = DIFFICULTY_CONFIG[diffInfo?.level ?? 'DEBUTANT'];
 const DiffIcon = diffCfg.Icon;

 // Validation temps reel
 const validateName = (name: string) => {
 setCharacterName(name);
 const result = validateCharacterName(name);
 setNameError(result.valid ? '' : (result.error ?? ''));
 };

  const statBars = [
 { key: 'force', label: 'Force', value: classInfo.baseStats.force, icon: Swords },
 { key: 'agility', label: 'Agilite', value: classInfo.baseStats.agility, icon: Zap },
 { key: 'magie', label: 'Intelligence', value: classInfo.baseStats.magie, icon: Brain },
 { key: 'endurance', label: 'Endurance', value: classInfo.baseStats.endurance, icon: Heart },
 ];

 // Navigation
 const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
 const handleNext = () => { if (currentStep < classes.length - 1) setCurrentStep(currentStep + 1); };

 // Soumission
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 const nameValidation = validateCharacterName(characterName);
 if (!nameValidation.valid) {
 setError(nameValidation.error ?? 'Nom invalide');
 return;
 }
 if (!userId) {
 setError('Utilisateur non connecte');
 return;
 }

 setIsLoading(true);
 setError('');

 try {
 const pointsVieInitiaux = 100 + (classInfo.baseStats.endurance * 10);

 const { data, error: insertError } = await supabase
 .from('personnage')
 .insert({
 nom_personnage: characterName.trim(),
 classe: classType,
 niveau: 1,
 points_vie: pointsVieInitiaux,
 force_personnage: classInfo.baseStats.force,
 agility_personnage: classInfo.baseStats.agility,
 magie_personnage: classInfo.baseStats.magie,
 endurance_personnage: classInfo.baseStats.endurance,
 experience: 0,
 id_utilisateur: userId,
 })
 .select()
 .single();

 if (insertError) throw new Error('Erreur lors de la création du personnage');

 const character: Character = {
 ...data,
 points_vie_max: pointsVieInitiaux,
 stats: classInfo.baseStats,
 experience: 0,
 };

 if (onCharacterCreated) onCharacterCreated(character);

 toast.success(
 <div className="flex items-center gap-2">
 <Check className="w-5 h-5 text-green-400" />
 <span>Personnage &laquo; {characterName.trim()} &raquo; créé avec succès !</span>
 </div>,
 { duration: 3000 }
 );
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Une erreur est intervenue');
 } finally {
 setIsLoading(false);
 }
 };

 const abilitiesWithInfo = classInfo.abilities
 .map(name => ABILITIES_DATA[name])
 .filter(Boolean);

 return (
 <div className="min-h-screen bg-[#0d1117] flex flex-col">
 {/* Header */}
 <div className="px-8 pt-8 pb-4 max-w-5xl mx-auto w-full">
 <button
 onClick={() => window.history.back()}
 className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm group"
 >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
 Retour
 </button>
 <h1 className="text-2xl md:text-3xl font-bold text-[#3b9ede] mt-2">
 Creation de Personnage
 </h1>
 </div>

 {/* Carte principale */}
 <div className="flex-1 px-4 pb-8 max-w-4xl mx-auto w-full">
 <div className="bg-[#131e35] rounded-2xl p-6 md:p-10 border border-gray-800/50 ">
 
 {/* Split layout */}
 <div className="flex flex-col md:flex-row gap-6 mb-8">
 {/* Colonne gauche */}
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <h2 className="text-3xl md:text-4xl font-bold text-white ">
 {classInfo.name}
 </h2>
 <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${diffCfg.bg} ${diffCfg.color} ${diffCfg.border}`}>
 <DiffIcon className="w-3 h-3" />
 {diffCfg.label}
 </span>
 </div>

 <span className="text-[#3b9ede] text-sm font-medium mb-3 block">
 {classInfo.role}
 </span>

 <p className="text-gray-400 text-sm leading-relaxed mb-6">
 {classInfo.description}
 </p>

 {/* Barres de stats */}
 <div className="space-y-3 mb-6">
 {statBars.map((stat) => (
 <div key={stat.key} className="flex items-center gap-3">
 <stat.icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
 <span className="text-gray-300 text-sm w-24">{stat.label}</span>
 <div className="flex-1 bg-[#141d2e] rounded-full h-2 overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-500"
 style={{ width: `${(stat.value / 10) * 100}%` }}
 />
 </div>
 <span className="text-cyan-400 font-medium text-sm w-10 text-right tabular-nums">
 {stat.value}/10
 </span>
 </div>
 ))}
 </div>

 {/* Tags capacites */}
 <div className="flex flex-wrap gap-2">
 {abilitiesWithInfo.map((ability, idx) => {
 const badge = ABILITY_BADGES[ability.type] ?? ABILITY_BADGES.PASSIVE;
 return (
 <div key={ability.name} className="group relative">
 <span
 className={`inline-block px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-default ${
 idx === 0
 ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/50'
 : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
 }`}
 >
 {ability.name}
 </span>
 {/* Tooltip */}
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-lg bg-gray-900 border border-gray-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
 <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 border ${badge.color} ${badge.border}`}>
 {badge.label}
 </span>
 <p className="text-xs text-gray-300 leading-relaxed">
 {ability.description}
 </p>
 {ability.cooldown && ability.cooldown > 0 && (
 <p className="text-xs text-gray-500 mt-1">
 Recharge : {ability.cooldown} tours
 </p>
 )}
 <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 -mt-1" />
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Colonne droite : illustration */}
 <div className="relative flex-shrink-0">
 <div className="relative w-[280px] h-[300px] md:w-[300px] md:h-[280px] mx-auto">
 <Image
 src={classInfo.image}
 alt={classInfo.name}
 fill
 sizes="300px"
 className="object-contain"
 priority
 />
 </div>

 {/* Fleches navigation */}
 <div className="flex items-center justify-center gap-4 mt-3">
 <button
 onClick={handlePrevious}
 disabled={currentStep === 0}
 className="w-10 h-10 rounded-full bg-[#141d2e]/90 hover:bg-cyan-600/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all border border-gray-700/50 hover:border-cyan-500/50"
 aria-label="Classe precedente"
 >
 <ChevronLeft className="w-5 h-5 text-white" />
 </button>
 <span className="text-xs text-gray-500 font-medium">
 {currentStep + 1} / {classes.length}
 </span>
 <button
 onClick={handleNext}
 disabled={currentStep === classes.length - 1}
 className="w-10 h-10 rounded-full bg-[#141d2e]/90 hover:bg-cyan-600/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all border border-gray-700/50 hover:border-cyan-500/50"
 aria-label="Classe suivante"
 >
 <ChevronRight className="w-5 h-5 text-white" />
 </button>
 </div>
 </div>
 </div>

 {/* Separateur */}
 <div className="border-t border-gray-800/50 my-6" />

 {/* Formulaire */}
 <form onSubmit={handleSubmit}>
 <div className="mb-5">
 <label htmlFor="characterName" className="block text-gray-300 text-sm mb-2 font-medium">
 Nom du Personnage
 </label>
 <div className="relative">
 <input
 id="characterName"
 type="text"
 value={characterName}
 onChange={(e) => validateName(e.target.value)}
 placeholder="Entrez le nom de votre personnage..."
 maxLength={20}
className={`w-full px-4 py-3 bg-[#0d1117] border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all text-sm ${
 nameError
 ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
 : characterName.length >= 3
 ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/30'
 : 'border-gray-700 focus:border-cyan-500/50 focus:ring-cyan-500/30'
 }`}
 />
 {characterName.length > 0 && (
 <div className="absolute right-3 top-1/2 -translate-y-1/2">
 {nameError ? (
 <AlertCircle className="w-4 h-4 text-red-400" />
 ) : characterName.length >= 3 ? (
 <Check className="w-4 h-4 text-green-400" />
 ) : null}
 </div>
 )}
 </div>
 {nameError && (
 <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 {nameError}
 </p>
 )}
 {!nameError && characterName.length > 0 && characterName.length < 3 && (
 <p className="mt-1 text-xs text-gray-500 ">
 Minimum 3 caracteres ({characterName.length}/3)
 </p>
 )}
 </div>

 {error && (
 <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
 <AlertCircle className="w-4 h-4 flex-shrink-0" />
 {error}
 </div>
 )}

 {characterName.trim().length >= 3 && (
 <div className="mb-5 p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
 <p className="text-sm text-gray-400 text-center">
 <span className="text-cyan-400 font-bold">{characterName.trim()}</span>
 {' '}&mdash;{' '}
 <span className="text-white ">{classType}</span>
 </p>
 </div>
 )}

 <button
 type="submit"
 disabled={isLoading || !characterName.trim() || !!nameError}
 className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 disabled:shadow-none text-sm"
 >
 {isLoading ? (
 <span className="flex items-center justify-center gap-2">
 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 Creation en cours...
 </span>
 ) : (
 'Créer votre Personnage'
 )}
 </button>
 </form>
 </div>

 {/* Pagination */}
 <div className="flex justify-center gap-2 mt-6">
 {classes.map((_, index) => (
 <button
 key={index}
 onClick={() => setCurrentStep(index)}
 className={`h-2 rounded-full transition-all duration-300 ${
 index === currentStep
 ? 'bg-cyan-400 w-6 shadow-lg shadow-cyan-400/30'
 : index < currentStep
 ? 'bg-cyan-800/50 w-2 hover:w-3'
 : 'bg-gray-700 w-2 hover:bg-gray-500 hover:w-3'
 }`}
 aria-label={`Aller a la classe ${index + 1}`}
 />
 ))}
 </div>
 </div>
 </div>
 );
}

