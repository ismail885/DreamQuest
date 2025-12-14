'use client';

import { useAuth } from '@/hooks/useAuth';
import CreateCharacterForm from '@/components/character/CreateCharacterForm';
import { useRouter } from 'next/navigation';
import type { Character } from '@/types';

export default function CreateCharacterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const handleCharacterCreated = (character: Character) => {
    console.log('Personnage créé:', character);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <CreateCharacterForm
        userId={parseInt(user.id) || 1}
        onCharacterCreated={handleCharacterCreated}
      />
    </div>
  );
}
