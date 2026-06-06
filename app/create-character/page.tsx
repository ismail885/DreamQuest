"use client";

import { Suspense } from "react";
import { useAuthContext } from "@/context/AuthContext";
import CreateCharacterForm from "@/components/character/CreateCharacterForm";
import PageTransition from "@/components/shared/PageTransition";
import { useRouter } from "next/navigation";
import type { Character } from "@/types";
import { updateQuestProgress } from "@/lib/dailyQuests";
import Loader from "@/components/shared/Loader";

export default function CreateCharacterPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    router.replace("/auth/login");
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const handleCharacterCreated = (character: Character) => {
    updateQuestProgress(user.id, "create_char", 1).catch(() => {});
    router.push(`/adventure?personnage=${character.id}`);
  };

  return (
    <Suspense fallback={<Loader fullScreen />}>
    <div className="min-h-screen bg-deep pb-24 md:pb-0">
      <PageTransition>
        <CreateCharacterForm
          userId={user.id}
          onCharacterCreated={handleCharacterCreated}
        />
      </PageTransition>
    </div>
    </Suspense>
  );
}
