"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import PageBackground from "@/components/shared/PageBackground";
import PageTransition from "@/components/shared/PageTransition";
import AdventureCard from "@/components/adventure/AdventureCard";
import { SkeletonAdventureList } from "@/components/shared/Skeleton";
import { Search, X, User, Frown } from "lucide-react";
import { useAdventureList, FILTER_OPTIONS } from "@/hooks/useAdventureList";
import AdventurePagination from "@/components/adventure/AdventurePagination";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeOutExpo },
  },
};

export default function AdventurePage() {
  return (
    <Suspense>
      <AdventurePageContent />
    </Suspense>
  );
}

function AdventurePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personnageId = searchParams.get("personnage");
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const {
    adventures: filteredAdventures,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    activeFilter,
    searchQuery,
    setCurrentPage,
    setActiveFilter,
    setSearchQuery,
  } = useAdventureList();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative pb-24 md:pb-0">
        <PageBackground />

        <PageTransition className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
              Explorez les Aventures
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto ">
              Choisissez votre prochaine aventure parmi nos histoires épiques
            </p>
          </motion.div>

          {personnageId && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="max-w-4xl mx-auto mb-6 md:mb-8"
            >
              <div className="flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-card">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <p className="text-cyan-300 text-sm">
                  Personnage sélectionné — choisissez une aventure pour
                  commencer !
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.15 }}
            className="max-w-4xl mx-auto mb-8 md:mb-12"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center border border-cyan-500/20 rounded-xl bg-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-300">
                <Search className="ml-4 w-5 h-5 text-gray-400 flex-shrink-0 group-focus-within:text-primary transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Rechercher une histoire..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 md:px-4 py-3 md:py-3.5 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm md:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="mr-3 p-1 text-gray-400 hover:text-primary transition-colors duration-200"
                    title="Effacer la recherche"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mb-1">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setActiveFilter(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                      activeFilter === option.value
                        ? "bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-transparent border border-cyan-500/20 text-gray-300 hover:text-white hover:border-cyan-500/40"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="text-gray-400 text-sm whitespace-nowrap">
                <span className="font-semibold text-primary">
                  {filteredAdventures.length}
                </span>{" "}
                aventure{filteredAdventures.length !== 1 ? "s" : ""} trouvée
                {filteredAdventures.length !== 1 ? "s" : ""}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <SkeletonAdventureList count={6} />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="text-center py-20"
            >
              <p className="text-red-400 text-lg">{error}</p>
            </motion.div>
          ) : filteredAdventures.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
              >
                {filteredAdventures.map((adventure) => (
                  <motion.div key={adventure.id} variants={itemVariants}>
                    <AdventureCard
                      id={adventure.id}
                      titre={adventure.titre}
                      description={adventure.description}
                      popularite={adventure.popularite}
                      personnageId={personnageId ?? undefined}
                      onNavigateWithoutCharacter={() =>
                        setShowCharacterModal(true)
                      }
                      genre={adventure.genre}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4, ease: easeOutExpo }}
              >
                <AdventurePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                <Frown className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-300 text-lg">Aucune aventure trouvée</p>
              <p className="text-gray-400 text-sm mt-2">
                Essayez de modifier vos critères de recherche
              </p>
            </motion.div>
          )}
        </PageTransition>

        <AnimatePresence>
          {showCharacterModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            >
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setShowCharacterModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: easeOutExpo }}
                className="relative backdrop-blur-card bg-deep border border-cyan-500/20 rounded-t-2xl md:rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto md:max-h-none"
              >
                <button
                  onClick={() => setShowCharacterModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    Sélectionnez un personnage
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Vous devez choisir un personnage avant de commencer une
                    aventure.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setShowCharacterModal(false);
                        router.push("/profil?tab=characters");
                      }}
                      className="w-full px-6 py-3 bg-transparent border border-cyan-500/20 text-primary font-semibold rounded-card hover:bg-cyan-500/5 transition-colors duration-200"
                    >
                      Mes personnages
                    </button>
                    <button
                      onClick={() => {
                        setShowCharacterModal(false);
                        router.push("/create-character");
                      }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-semibold rounded-card hover:scale-102 active:scale-98 hover:shadow-[0px_10px_25px_-3px_rgba(6,182,212,0.5)] transition-all duration-300 ease-out"
                    >
                      Créer un personnage
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}


