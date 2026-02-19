"use client";

import { useState } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AdventureCard from "@/components/adventure/AdventureCard";

type Genre = "Tous" | "Fantasy" | "Sci-Fi" | "Horreur";

const adventures = [
  {
    id: 1,
    title: "La Quête du Dragon Ancien",
    description: "Une aventure médiévale épique où vous devez retrouver l'ancien dragon qui garde le trésor légendaire.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=400&fit=crop",
    rating: 4.2,
    genre: "Fantasy",
    ageRange: "12-16 ans",
    players: 1245,
  },
  {
    id: 2,
    title: "Les Ombres de la Forêt Maudite",
    description: "Une forêt enchantée cache de sombres secrets. Osez-vous entrer dans la forêt interdite ?",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=400&fit=crop",
    rating: 4.5,
    genre: "Fantasy",
    ageRange: "16+ ans",
    players: 2341,
  },
  {
    id: 3,
    title: "L'Académie des Arcanes",
    description: "Entrez dans la plus prestigieuse école de magie du royaume et maîtrisez l'art de la sorcellerie.",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab064?w=800&h=400&fit=crop",
    rating: 4.8,
    genre: "Fantasy",
    ageRange: "12-16 ans",
    players: 3267,
  },
  {
    id: 4,
    title: "Nexon Station",
    description: "Une station spatiale abandonnée recèle une technologie extraterrestre à la recherche d'un hôte idéal.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=400&fit=crop",
    rating: 4.2,
    genre: "Sci-Fi",
    ageRange: "16+ ans",
    players: 982,
  },
  {
    id: 5,
    title: "Le Trésor des Pirates",
    description: "Naviguez sur les mers dangereuses à la recherche d'un trésor caché par un pirate légendaire.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop",
    rating: 4.6,
    genre: "Fantasy",
    ageRange: "8-12 ans",
    players: 1876,
  },
  {
    id: 6,
    title: "Le Manoir Hanté",
    description: "Explorez un manoir obscur rempli de mystères et d'entités surnaturelles.",
    image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&h=400&fit=crop",
    rating: 4.1,
    genre: "Horreur",
    ageRange: "16+ ans",
    players: 1523,
  },
];

export default function AdventurePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("Tous");

  const filteredAdventures = adventures.filter((adventure) => {
    const matchesSearch = adventure.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === "Tous" || adventure.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20"></div>

        <div className="container mx-auto px-6 py-12 relative z-10">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Explorez les Aventures
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choisissez votre prochaine aventure parmi nos histoires épiques
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto space-y-6 mb-12">
            {/* Search Bar */}
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

            {/* Genre Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {(["Tous", "Fantasy", "Sci-Fi", "Horreur"] as Genre[]).map(
                (genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      selectedGenre === genre
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-[#0f1322] text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Adventures Grid */}
          {filteredAdventures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdventures.map((adventure) => (
                <AdventureCard key={adventure.id} {...adventure} />
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
