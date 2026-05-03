"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Star, Sparkles } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import Loader from "@/components/shared/Loader";
import CharacterList from "@/components/character/CharacterList";

interface UserStats {
  charactersCount: number;
  completedQuests: number;
  totalXp: number;
}

interface PopularAdventure {
  id: number;
  titre: string;
  description: string | null;
  popularite: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [stats, setStats] = useState<UserStats>({
    charactersCount: 0,
    completedQuests: 0,
    totalXp: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<PopularAdventure[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setStatsLoading(true);
      try {
        // Une seule requête pour les personnages
        const { data: characters } = await supabase
          .from("personnage")
          .select("experience")
          .eq("id_utilisateur", user.id);

        const charactersCount = characters?.length ?? 0;
        const totalXp =
          characters?.reduce((sum, c) => sum + (c.experience ?? 0), 0) ?? 0;

        // Une seule requête pour les sauvegardes
        const { data: saves } = await supabase
          .from("sauvegarde")
          .select("progression")
          .eq("id_utilisateur", user.id);

        const completedQuests =
          saves?.filter((s) => s.progression >= 100).length ?? 0;

        setStats({ charactersCount, completedQuests, totalXp });
      } catch (err) {
        console.error("Erreur stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;

      setLoadingSuggestions(true);
      try {
        // Get played adventure IDs
        const { data: saves } = await supabase
          .from("sauvegarde")
          .select("id_aventure")
          .eq("id_utilisateur", user.id);

        const playedIds = saves?.map((s) => s.id_aventure) ?? [];

        // Get unplayed adventures, ordered by popularity
        let query = supabase
          .from("aventure")
          .select("id, titre, description, popularite")
          .order("popularite", { ascending: false })
          .limit(3);

        if (playedIds.length > 0) {
          query = query.not("id", "in", `(${playedIds.join(",")})`);
        }

        const { data } = await query;

        if (data) setSuggestions(data);
      } catch (err) {
        console.error("Erreur suggestions:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (user) fetchSuggestions();
  }, [user]);

  if (loading || statsLoading) {
    return <Loader fullScreen message="Chargement de votre espace..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary flex flex-col">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-content-primary mb-2">
              Bienvenue,{" "}
              <span className="text-cyan-400">
                {user?.username || "Aventurier"}
              </span>{" "}
              !
            </h1>
            <p className="text-content-secondary text-sm md:text-base">
              Prêt à vivre de nouvelles aventures ?
            </p>
          </div>

          <div className="mb-8 md:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-content-primary">
                Mes Personnages
              </h2>
              <button
                onClick={() => router.push("/create-character")}
                className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-content-primary font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Créer un Personnage
              </button>
            </div>
            {user && <CharacterList userId={user.id} />}
          </div>

          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-content-primary mb-4 md:mb-6">
              Vos Statistiques
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-1 md:mb-2">
                  {stats.charactersCount}
                </div>
                <div className="text-content-secondary text-xs md:text-sm">
                  Personnages
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1 md:mb-2">
                  {stats.completedQuests}
                </div>
                <div className="text-content-secondary text-xs md:text-sm">Quêtes</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 md:mb-2">
                  {stats.totalXp}
                </div>
                <div className="text-content-secondary text-xs md:text-sm">
                  Points XP
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1 md:mb-2">
                  -
                </div>
                <div className="text-content-secondary text-xs md:text-sm">
                  Niveau max
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions personnalisées */}
          {user && (
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-content-primary mb-4 md:mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Pour Vous
              </h2>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {loadingSuggestions
                  ? [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-surface-secondary border border-yellow-500/20 rounded-xl p-5 animate-pulse"
                      >
                        <div className="h-5 bg-gray-700/50 rounded w-1/3 mb-3" />
                        <div className="h-4 bg-gray-700/50 rounded w-2/3" />
                      </div>
                    ))
                  : suggestions.length > 0
                    ? suggestions.map((adventure) => (
                        <div
                          key={adventure.id}
                          onClick={() =>
                            router.push(
                              `/adventure/${adventure.id}?personnage=${user.id}`,
                            )
                          }
                          className="bg-gradient-to-br from-[#0d1526] to-[#131929] border border-yellow-500/20 rounded-xl p-5 hover:border-yellow-500/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                            </div>
                            <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                              Recommandé
                            </span>
                          </div>
                          <h3 className="text-content-primary font-semibold mb-2 line-clamp-1">
                            {adventure.titre}
                          </h3>
                          <p className="text-content-secondary text-sm line-clamp-2">
                            {adventure.description ||
                              "Une aventure palpitante vous attend..."}
                          </p>
                        </div>
                      ))
                    : null}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
