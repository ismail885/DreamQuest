'use client';

import { useState } from 'react';
import { CHARACTER_CLASSES, CharacterClass, Character } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import ClassCard from './ClassCard';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

interface CreateCharacterFormProps {
  userId?: number;
  onCharacterCreated?: (character: Character) => void;
}

export default function CreateCharacterForm({ userId, onCharacterCreated }: CreateCharacterFormProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const classes = Object.values(CHARACTER_CLASSES);
  const totalSteps = classes.length;

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleClassSelect = (classType: CharacterClass) => {
    setSelectedClass(classType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setError('Veuillez sélectionner une classe');
      return;
    }

    if (!characterName.trim()) {
      setError('Veuillez entrer un nom pour votre personnage');
      return;
    }

    if (!userId) {
      setError('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const classInfo = CHARACTER_CLASSES[selectedClass];
      const pointsVieInitiaux = 100 + (classInfo.baseStats.endurance * 10);

      const { data, error: insertError } = await supabase
        .from('personnage')
        .insert({
          nom_personnage: characterName,
          classe: selectedClass,
          niveau: 1,
          points_vie: pointsVieInitiaux,
          id_utilisateur: userId,
        })
        .select()
        .single();

      console.log('DEBUG insert personnage → userId:', userId, '| error:', insertError, '| data:', data);

      if (insertError) {
        throw new Error('Erreur lors de la création du personnage');
      }

      const character: Character = {
        ...data,
        points_vie_max: pointsVieInitiaux,
        stats: classInfo.baseStats,
        experience: 0,
      };

      if (onCharacterCreated) {
        onCharacterCreated(character);
      }
      toast.success(
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-400" />
          <span>Personnage « {characterName} » créé avec succès !</span>
        </div>,
        { duration: 3000 }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const currentClass = classes[currentStep];

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
          Création de Personnage
        </h1>
      </div>

      <div className="relative mb-8">
        {currentStep > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#1a2332]/90 hover:bg-cyan-600/50 hover:scale-110 rounded-full p-3 transition-all duration-200 active:scale-95"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="max-w-2xl mx-auto px-12 transition-all duration-300">
          <ClassCard
            classInfo={currentClass}
            isSelected={selectedClass === currentClass.name}
            onSelect={() => handleClassSelect(currentClass.name)}
          />
        </div>

        {currentStep < totalSteps - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#1a2332]/90 hover:bg-cyan-600/50 hover:scale-110 rounded-full p-3 transition-all duration-200 active:scale-95"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {classes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`h-2 rounded-full transition-all duration-200 ${
              index === currentStep
                ? 'bg-cyan-400 w-8 shadow-lg shadow-cyan-400/30'
                : 'bg-gray-700 w-2 hover:bg-gray-500 hover:w-4'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-6">
          <label htmlFor="characterName" className="block text-white text-sm mb-3 font-medium">
            Nom du Personnage
          </label>
          <input
            id="characterName"
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Entrez le nom de votre personnage..."
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 focus:border-cyan-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            maxLength={50}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {selectedClass && characterName.trim() && (
          <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
            <span className="text-lg text-gray-400">Créer </span>
            <span className="text-xl font-bold text-cyan-400">{characterName}</span>
            <span className="text-lg text-gray-400"> - {selectedClass}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedClass || !characterName.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? 'Création en cours...' : 'Créer votre Personnage'}
        </button>
      </form>
    </div>
  );
}