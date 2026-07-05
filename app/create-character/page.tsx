"use client";

import { Suspense, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import CreateCharacterForm from "@/components/character/CreateCharacterForm";
import PageTransition from "@/components/shared/PageTransition";
import { useRouter } from "next/navigation";
import type { Character } from "@/types";
import { updateQuestProgress } from "@/lib/dailyQuests";
import { checkAndNotifyAchievements } from "@/lib/achievements";
import toast from "react-hot-toast";
import Loader from "@/components/shared/Loader";

export default function CreateCharacterPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const handleCharacterCreated = (character: Character) => {
    updateQuestProgress(user.id, "create_char", 1).then((r) => {
      if (r.completion) {
        toast.success(`Quête terminée : ${r.completion.questId} (+${r.completion.xpAwarded} XP)`);
      }
      window.dispatchEvent(new CustomEvent("profile-refresh"));
      checkAndNotifyAchievements(user.id, (msg) => toast.success(msg));
    }).catch(() => {});
    router.push(`/adventure?personnage=${character.id}`);
  };

  return (
    <Suspense fallback={<Loader fullScreen />}>
    <main className="min-h-screen bg-deep pb-24 md:pb-0">
      <PageTransition>
        <CreateCharacterForm
          userId={user.id}
          onCharacterCreated={handleCharacterCreated}
        />
      </PageTransition>
    </main>
    </Suspense>
  );
}
