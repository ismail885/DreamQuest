"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import AdventureCard from "@/components/adventure/AdventureCard";
import { SkeletonAdventureList } from "@/components/shared/Skeleton";
import { supabase } from "@/lib/supabaseClient";
import type { AdventureListItem } from "@/types/adventure";

const ITEMS_PER_PAGE = 12;

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

  useEffect(() => {
    const fetchAdventures = async () => {
      setLoading(true);
      
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await supabase
        .from("aventure")
        .select("id, titre, description, popularite", { count: "exact" })
        .order("popularite", { ascending: false })
        .range(from, to);

      if (error) {
        setError("Impossible de charger les aventures.");
      } else {
        setAdventures(data ?? []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    };

    fetchAdventures();
  }, [currentPage]);

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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Explorez les Aventures
            </h1>
            <p className="text-gray-400 text-sm md:text-lg max-w-xl mx-auto">
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
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-[#0f1322] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm md:text-base"
              />
              <svg
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#1a2235] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1f2940] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              ? "bg-cyan-500 text-white"
                              : "bg-[#1a2235] border border-gray-700 text-gray-300 hover:bg-[#1f2940]"
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
                    className="px-4 py-2 bg-[#1a2235] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1f2940] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              <p className="text-center text-gray-500 text-sm mt-4">
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
              <p className="text-gray-400 text-lg">Aucune aventure trouvée</p>
              <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
