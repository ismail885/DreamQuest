"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { canCreateStory, isAdmin, type UserRole } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import PageTransition from "@/components/shared/PageTransition";
import AdventureEditor from "@/components/editor/AdventureEditor";

function EditorContent() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="min-h-screen bg-deep flex flex-col items-center justify-center gap-6 px-4">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-gray-300 text-lg text-center"
        >
          Connexion requise pour accéder à cette page
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
          href="/auth/login?redirect=/create-adventure"
          className="px-6 py-3 bg-gradient-to-r from-primary to-[#3b82f6] text-white font-semibold rounded-[10px] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0px_10px_25px_-3px_rgba(6,182,212,0.5)]"
        >
          Se connecter
        </motion.a>
      </div>
    );
  }

  const canCreate =
    canCreateStory(user.role as UserRole) || isAdmin(user.role as UserRole);

  if (!canCreate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="min-h-screen bg-deep flex items-center justify-center px-4"
      >
        <p className="text-red-400 text-lg text-center">Accès restreint aux créateurs</p>
      </motion.div>
    );
  }

  return (
    <PageTransition>
      <AdventureEditor />
    </PageTransition>
  );
}

export default function CreateAdventurePage() {
  return (
    <Suspense fallback={<Loader />}>
      <EditorContent />
    </Suspense>
  );
}
