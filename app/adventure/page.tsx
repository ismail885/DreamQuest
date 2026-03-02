"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AdventureCard from "@/components/adventure/AdventureCard";
import { supabase } from "@/lib/supabaseClient";
import type { Adventure } from "@/types/adventure";

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
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdventures = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("aventure")
        .select("*")
        .order("popularite", { ascending: false });

      if (error) {
        setError("Impossible de charger les aventures.");
      } else {
        setAdventures(data ?? []);
      }
      setLoading(false);
    };

    fetchAdventures();
  }, []);

  const filteredAdventures = adventures.filter((adventure) =>
    adventure.titre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20"></div>

        <div className="container mx-auto px-6 py-12 relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Explorez les Aventures
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choisissez votre prochaine aventure parmi nos histoires épiques
            </p>
          </div>

          {personnageId && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
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

          <div className="max-w-4xl mx-auto space-y-6 mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une histoire"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-[#0f1322] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <svg
                className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Chargement des aventures...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : filteredAdventures.length > 0 ? (
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
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">
                Aucune aventure trouvée
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
