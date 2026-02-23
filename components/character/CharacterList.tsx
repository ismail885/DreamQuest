'use client';

import { useState, useEffect } from 'react';
import { Character } from '@/types';
import CharacterCard from './CharacterCard';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface CharacterListProps {
  userId: number | string;
}

export default function CharacterList({ userId }: CharacterListProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const { data, error } = await supabase
          .from('personnage')
          .select('*')
          .eq('id_utilisateur', userId);

        if (error) throw error;
        setCharacters(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [userId]);

  const handleDelete = async (characterId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('personnage')
        .delete()
        .eq('id_personnage', characterId);

      if (error) throw error;

      setCharacters(characters.filter(c => c.id_personnage !== characterId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-400">
        {error}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-lg mb-2">Aucun personnage créé</p>
          <p className="text-sm">Créez votre premier personnage pour commencer votre aventure</p>
        </div>
        <Link
          href="/create-character"
          className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
        >
          Créer un personnage
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {characters.map((character, index) => (
        <CharacterCard
          key={character.id_personnage ?? index}
          character={character}
          onDelete={() => handleDelete(character.id_personnage!)}
        />
      ))}
    </div>
  );
}
