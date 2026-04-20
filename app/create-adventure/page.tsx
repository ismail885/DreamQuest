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
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <p className="text-gray-400">Connexion requise</p>
      </div>
    );
  }
  
  const canCreate = canCreateStory(user.role as UserRole) || isAdmin(user.role as UserRole);
  
  if (!canCreate) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <p className="text-red-400">Accès restreint aux créateurs</p>
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