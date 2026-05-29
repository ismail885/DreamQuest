"use client";

import { Suspense } from "react";
import { canCreateStory, isAdmin, type UserRole } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import AdventureEditor from "@/components/editor/AdventureEditor";

function EditorContent() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center gap-6">
        <p className="text-[#8B949E] text-lg">
          Connexion requise pour accéder à cette page
        </p>
        <a
          href="/auth/login?redirect=/create-adventure"
          className="px-6 py-3 bg-[#22D3EE] text-[#0D1117] font-bold rounded-lg hover:bg-[#22D3EE]/90 transition-all"
        >
          Se connecter
        </a>
      </div>
    );
  }

  const canCreate =
    canCreateStory(user.role as UserRole) || isAdmin(user.role as UserRole);

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <p className="text-[#F85149]">Accès restreint aux créateurs</p>
      </div>
    );
  }

  return <AdventureEditor />;
}

export default function CreateAdventurePage() {
  return (
    <Suspense fallback={<Loader />}>
      <EditorContent />
    </Suspense>
  );
}
