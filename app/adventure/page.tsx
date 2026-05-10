"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import AdventureCard from "@/components/adventure/AdventureCard";
import { SkeletonAdventureList } from "@/components/shared/Skeleton";
import { supabase } from "@/lib/supabaseClient";
import type { AdventureListItem } from "@/types/adventure";

const ITEMS_PER_PAGE = 12;

type SortOption = 'popularite' | 'date' | 'alpha';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularite', label: 'Popularite' },
  { value: 'date', label: 'Recent' },
  { value: 'alpha', label: 'A-Z' },
];

export default function AdventurePage() {
  return (
    <Suspense>
      <AdventurePageContent />
    </Suspense>
  );
}

function AdventurePageContent() {
  const searchParams = useSearchParams();
  const personnageId = searchParams.get("personnage");
  const [searchQuery, setSearchQuery] = useState("");
  const [adventures, setAdventures] = useState<AdventureListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>('popularite');
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  useEffect(() => {
    const fetchAdventures = async () => {
      setLoading(true);
      
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from("aventure")
        .select("id, titre, description, popularite", { count: "exact" });

      // Apply sorting
      switch (sortOption) {
        case 'popularite':
          query = query.order("popularite", { ascending: false });
          break;
        case 'date':
          query = query.order("date_creation", { ascending: false });
          break;
        case 'alpha':
          query = query.order("titre", { ascending: true });
          break;
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        setError("Impossible de charger les aventures.");
      } else {
        setAdventures(data ?? []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    };

    fetchAdventures();
  }, [currentPage, sortOption]);

  // Reset to page 1 when sort option changes
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const filteredAdventures = adventures.filter((adventure) =>
    adventure.titre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative pb-24 md:pb-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20"></div>

        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-content-primary">
              Explorez les Aventures
            </h1>
            <p className="text-content-secondary text-sm md:text-lg max-w-xl mx-auto">
              Choisissez votre prochaine aventure parmi nos histoires épiques
            </p>
          </div>

          {personnageId && (
            <div className="max-w-4xl mx-auto mb-6 md:mb-8">
              <div className="flex items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-cyan-300 text-sm">
                  Personnage sélectionné — choisissez une aventure pour commencer !
                </p>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 mb-8 md:mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une histoire"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-surface-secondary border border-gray-800 rounded-xl text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm md:text-base"
              />
              <svg
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-content-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Tri & Count */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-content-secondary text-xs uppercase tracking-wider">Trier par</span>
                <div className="flex gap-2">
                  {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortOption === option.value
                        ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-surface-secondary border border-gray-700/50 text-content-secondary hover:text-content-primary hover:border-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              </div>
              <div className="text-content-secondary text-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-surface-tertiary border border-gray-700 rounded-lg text-content-secondary hover:bg-surface-tertiary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-cyan-500 text-content-primary"
                              : "bg-surface-tertiary border border-gray-700 text-content-secondary hover:bg-surface-tertiary/80"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-surface-tertiary border border-gray-700 rounded-lg text-content-secondary hover:bg-surface-tertiary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              <p className="text-center text-content-secondary text-sm mt-4">
                {totalCount} aventures • Page {currentPage}/{totalPages}
              </p>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-content-secondary text-lg">Aucune aventure trouvée</p>
              <p className="text-content-secondary text-sm mt-2">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>

      {showCharacterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCharacterModal(false)}
          />
          <div className="relative bg-[#0f1322] border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <button
              onClick={() => setShowCharacterModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Sélectionnez un personnage</h3>
              <p className="text-gray-400 mb-6">Vous devez choisir un personnage avant de commencer une aventure.</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowCharacterModal(false);
                    window.location.href = '/profil?tab=characters';
                  }}
                  className="w-full px-6 py-3 bg-surface-secondary border border-cyan-500/30 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500/10 transition-colors"
                >
                  Mes personnages
                </button>
                <button
                  onClick={() => {
                    setShowCharacterModal(false);
                    window.location.href = '/create-character';
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
