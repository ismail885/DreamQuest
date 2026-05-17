'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Character, CHARACTER_CLASSES } from '@/types';
import CharacterCard from './CharacterCard';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { SkeletonCharacterList } from '@/components/shared/Skeleton';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';


type SortOption = 'nom' | 'niveau' | 'date';

interface CharacterListProps {
  userId: number | string;
}

export default function CharacterList({ userId }: CharacterListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Character | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | string | null>(null);
  const lastUserIdRef = useRef(userId);

  // Read initial selection from URL
  useEffect(() => {
    const personnageParam = searchParams.get('personnage');
    if (personnageParam) {
      setSelectedCharacterId(personnageParam);
    }
  }, [searchParams]);

  const sortedCharacters = useMemo(() => {
    const chars = [...characters];
    switch (sortBy) {
      case 'nom':
        return chars.sort((a, b) => a.nom_personnage.localeCompare(b.nom_personnage));
      case 'niveau':
        return chars.sort((a, b) => (b.niveau ?? 0) - (a.niveau ?? 0));
      case 'date':
      default:
        return chars.sort((a, b) => {
          const dateA = a.date_creation ? new Date(a.date_creation).getTime() : 0;
          const dateB = b.date_creation ? new Date(b.date_creation).getTime() : 0;
          return dateB - dateA;
        });
    }
  }, [characters, sortBy]);

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('personnage')
        .select('*')
        .eq('id_utilisateur', userId)
        .order('id', { ascending: false });

      if (error) {
        console.error('Erreur fetch personnages:', error);
        setError(error.message);
        return;
      }

      const enriched: Character[] = (data ?? []).map((row) => {
        const classInfo = CHARACTER_CLASSES[row.classe as keyof typeof CHARACTER_CLASSES];
        return {
          ...row,
          stats: classInfo?.baseStats ?? { force: 0, agility: 0, magie: 0, endurance: 0 },
          points_vie_max: row.points_vie_max ?? (classInfo ? 100 + classInfo.baseStats.endurance * 10 : 100),
          experience: row.experience ?? 0,
        };
      });

      setCharacters(enriched);
      setError('');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      fetchCharacters();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    fetchCharacters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchCharacters();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteRequest = async (character: Character) => {
    setDeleteError('');
    
    // Vérifier si le personnage a des sauvegardes
    if (character.id) {
      const { data: saves } = await supabase
        .from('sauvegarde')
        .select('id')
        .eq('id_personnage', character.id);
      
      const saveCount = saves?.length ?? 0;
      setDeleteError(saveCount > 0 ? `Ce personnage a ${saveCount} sauvegarde(s)` : '');
    }
    
    setPendingDelete(character);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete?.id) {
      setPendingDelete(null);
      return;
    }
    setIsDeleting(true);
    setDeleteError('');
    try {
      const { error } = await supabase
        .from('personnage')
        .delete()
        .eq('id', pendingDelete.id);

      if (error) throw error;

      setCharacters(prev => prev.filter(c => c.id !== pendingDelete.id));
      setPendingDelete(null);
      // Recharger pour être sûr
      fetchCharacters();
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
        <div className="text-gray-400 dark:text-gray-500 mb-4">
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
      
      {/* Menu de tri */}
      {characters.length > 1 && (
        <div className="flex justify-end mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-800 dark:bg-gray-100 border border-gray-700 dark:border-gray-300 rounded-lg px-4 py-2 text-sm text-white dark:text-gray-900 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="date">Plus récents</option>
            <option value="niveau">Niveau</option>
            <option value="nom">Nom</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCharacters.map((character, index) => (
          <CharacterCard
            key={character.id ?? index}
            character={character}
            onSelect={() => {
              if (selectedCharacterId === character.id) {
                router.push(`/adventure?personnage=${character.id}`);
              } else {
                setSelectedCharacterId(character.id!);
              }
            }}
            onDelete={() => handleDeleteRequest(character)}
            isSelected={selectedCharacterId === character.id}
          />
        ))}
      </div>
    </>
  );
}
