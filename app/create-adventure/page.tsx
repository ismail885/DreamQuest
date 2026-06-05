"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { canCreateStory, isAdmin, type UserRole } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import PageTransition from "@/components/shared/PageTransition";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import PageBackground from "@/components/shared/PageBackground";
import AdventureEditor from "@/components/editor/AdventureEditor";

function EditorContent() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="min-h-screen bg-deep flex flex-col">
        <PageBackground />
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 relative z-10">
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
            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-semibold rounded-card transition-all duration-300 ease-out hover:scale-102 active:scale-98 hover:shadow-[0px_10px_25px_-3px_rgba(6,182,212,0.5)]"
          >
            Se connecter
          </motion.a>
        </div>
        <Footer />
      </div>
    );
  }

  const canCreate =
    canCreateStory(user.role as UserRole) || isAdmin(user.role as UserRole);

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-deep flex flex-col">
        <PageBackground />
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex-1 flex items-center justify-center px-4 relative z-10"
        >
          <p className="text-red-400 text-lg text-center">Accès restreint aux créateurs</p>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackground />
      <Header />

      <PageTransition className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Créer une Aventure
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Concevez votre propre récit interactif à embranchements multiples
            </p>
          </div>
          <AdventureEditor />
        </div>
      </PageTransition>

      <Footer />
    </div>
  );
}

export default function CreateAdventurePage() {
  return (
    <Suspense fallback={<Loader />}>
      <EditorContent />
    </Suspense>
  );
}


