"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import AdventureCard from "@/components/adventure/AdventureCard";
import { SkeletonAdventureList } from "@/components/shared/Skeleton";
import { Search, X, User, Frown } from "lucide-react";
import { useAdventureList, FILTER_OPTIONS } from "@/hooks/useAdventureList";
import AdventurePagination from "@/components/adventure/AdventurePagination";

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
 <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none"></div>
 <div className="absolute top-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20"></div>

 <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
 <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
 <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3b9ede]">
 Explorez les Aventures
 </h1>
 <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto ">
 Choisissez votre prochaine aventure parmi nos histoires épiques
 </p>
 </div>

  {personnageId && (
  <div className="max-w-4xl mx-auto mb-6 md:mb-8">
  <div className="flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
  <User className="w-4 h-4 text-cyan-400" />
  </div>
  <p className="text-cyan-300 text-sm">
  Personnage sélectionné — choisissez une aventure pour commencer !
  </p>
  </div>
  </div>
  )}

 <div className="max-w-4xl mx-auto mb-8 md:mb-12">
 <div className="relative group">
 <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
 <div className="relative flex items-center border border-gray-700/50 rounded-xl bg-[#121827] focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-300">
 <Search className="ml-4 w-5 h-5 text-gray-500 flex-shrink-0" />
 <input
 type="text"
 placeholder="Rechercher une histoire..."
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
 className="w-full px-3 md:px-4 py-3 md:py-3.5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm md:text-base"
 />
 {searchQuery && (
 <button
 onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
 className="mr-3 p-1 text-gray-400 hover:text-white transition-colors"
 title="Effacer la recherche"
 >
 <X className="w-5 h-5" />
 </button>
 )}
 </div>
 </div>

 <div className="flex items-center justify-between gap-3">
 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mb-1">
 {FILTER_OPTIONS.map((option) => (
 <button
 key={option.value}
 onClick={() => setActiveFilter(option.value)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
 activeFilter === option.value
 ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
 : 'bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
 }`}
 >
 {option.label}
 </button>
 ))}
 </div>
 <div className="text-gray-500 text-sm">
 <span className="font-semibold text-cyan-400">{filteredAdventures.length}</span> aventure{filteredAdventures.length !== 1 ? 's' : ''} trouvée{filteredAdventures.length !== 1 ? 's' : ''}
 </div>
 </div>
 </div>

 {loading ? (
 <SkeletonAdventureList count={6} />
 ) : error ? (
 <div className="text-center py-20">
 <p className="text-red-400 text-lg">{error}</p>
 </div>
 ) : filteredAdventures.length > 0 ? (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
 {filteredAdventures.map((adventure) => (
 <AdventureCard
 key={adventure.id}
 id={adventure.id}
 titre={adventure.titre}
 description={adventure.description}
 popularite={adventure.popularite}
 personnageId={personnageId ?? undefined}
 onNavigateWithoutCharacter={() => setShowCharacterModal(true)}
 />
 ))}
 </div>

  <AdventurePagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalCount={totalCount}
  onPageChange={setCurrentPage}
  />
 </>
  ) : (
  <div className="text-center py-20">
  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4 ">
  <Frown className="w-8 h-8 text-gray-600" />
  </div>
  <p className="text-gray-400 text-lg ">Aucune aventure trouvée</p>
  <p className="text-gray-400 text-sm mt-2 ">Essayez de modifier vos critères de recherche</p>
  </div>
  )}
 </div>

 {showCharacterModal && (
 <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
 <div 
 className="absolute inset-0 bg-black/70 backdrop-blur-sm"
 onClick={() => setShowCharacterModal(false)}
 />
  <div className="relative bg-[#0f1322] border border-gray-700 rounded-t-2xl md:rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto md:max-h-none ">
  <button
  onClick={() => setShowCharacterModal(false)}
  className="absolute top-4 right-4 text-gray-400 hover:text-white"
  >
  <X className="w-6 h-6" />
  </button>
 
  <div className="text-center">
  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
  <User className="w-8 h-8 text-cyan-400" />
  </div>
 
 <h3 className="text-xl font-bold text-white mb-2 ">Sélectionnez un personnage</h3>
 <p className="text-gray-400 mb-6 ">Vous devez choisir un personnage avant de commencer une aventure.</p>
 
  <div className="flex flex-col gap-3">
  <button
  onClick={() => {
  setShowCharacterModal(false);
  router.push('/profil?tab=characters');
  }}
  className="w-full px-6 py-3 bg-[#0c1322] border border-cyan-500/30 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500/10 transition-colors "
  >
  Mes personnages
  </button>
  <button
  onClick={() => {
  setShowCharacterModal(false);
  router.push('/create-character');
  }}
  className="w-full px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
  >
  Créer un personnage
  </button>
  </div>
 </div>
 </div>
 </div>
 )}
 </main>

 <BottomNav />
 <Footer />
 </div>
 );
}

