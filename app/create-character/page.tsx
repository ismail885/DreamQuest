'use client';

import { useAuthContext } from '@/context/AuthContext';
import CreateCharacterForm from '@/components/character/CreateCharacterForm';
import BottomNav from '@/components/shared/BottomNav';
import { useRouter } from 'next/navigation';
import type { Character } from '@/types';

export default function CreateCharacterPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    router.replace('/auth/login');
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCharacterCreated = (_character: Character) => {
    router.push('/adventure');
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-24 md:pb-0">
      <CreateCharacterForm
        userId={user.id}
        onCharacterCreated={handleCharacterCreated}
      />
      <BottomNav />
    </div>
  );
}
