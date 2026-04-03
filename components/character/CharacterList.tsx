'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Character, CHARACTER_CLASSES } from '@/types';
import CharacterCard from './CharacterCard';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { SkeletonCharacterList } from '@/components/shared/Skeleton';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface CharacterListProps {
  userId: number | string;
}

export default function CharacterList({ userId }: CharacterListProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Character | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const { data, error } = await supabase
          .from('personnage')
          .select('*')
          .eq('id_utilisateur', userId);

        if (error) throw error;

        // Reconstitue les stats et points_vie_max depuis la classe (non stockés en BDD)
        const enriched: Character[] = (data ?? []).map((row) => {
          const classInfo = CHARACTER_CLASSES[row.classe as keyof typeof CHARACTER_CLASSES];
          return {
            ...row,
            stats: classInfo?.baseStats ?? { force: 0, agilite: 0, intelligence: 0, endurance: 0 },
            points_vie_max: row.points_vie_max ?? (classInfo ? 100 + classInfo.baseStats.endurance * 10 : 100),
            experience: row.experience ?? 0,
          };
        });

        setCharacters(enriched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [userId]);

  const handleDeleteRequest = (character: Character) => {
    setDeleteError('');
    setPendingDelete(character);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete?.id_personnage) {
      setPendingDelete(null);
      return;
    }
    setIsDeleting(true);
    setDeleteError('');
    try {
      const { error } = await supabase
        .from('personnage')
        .delete()
        .eq('id_personnage', pendingDelete.id_personnage);

      if (error) throw error;

      setCharacters(prev => prev.filter(c => c.id_personnage !== pendingDelete.id_personnage));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setPendingDelete(null);
    setDeleteError('');
  };

  if (isLoading) {
    return <SkeletonCharacterList count={3} />;
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
    <>
      {pendingDelete && (
        <ConfirmDeleteModal
          characterName={pendingDelete.nom_personnage}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character, index) => (
          <CharacterCard
            key={character.id_personnage ?? index}
            character={character}
            onSelect={() => router.push(`/adventure?personnage=${character.id_personnage}`)}
            onDelete={() => handleDeleteRequest(character)}
          />
        ))}
      </div>
    </>
  );
}
