"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, Plus, ChevronDown } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import Loader from "@/components/shared/Loader";

const CharacterList = dynamic(() => import("@/components/character/CharacterList"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#131e35] border border-gray-800/50 rounded-xl animate-pulse h-48" />
      ))}
    </div>
  ),
});

interface UserStats {
  charactersCount: number;
  completedQuests: number;
  totalXp: number;
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
  const [statsError, setStatsError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ id: number; titre: string; description: string | null }[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [pullState, setPullState] = useState<"idle" | "pulling" | "refreshing">("idle");
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current || pullState !== "idle") return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && window.scrollY <= 0) {
      setPullState("pulling");
      setPullDistance(Math.min(diff * 0.35, 100));
    }
  };
  const endPull = () => {
    if (pullDistance >= 55) {
      setPullState("refreshing");
      setPullDistance(128);
      setRefreshKey((k) => k + 1);
    } else {
      setPullState("idle");
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchData = async () => {
      setStatsLoading(true);
      setLoadingSuggestions(true);
      setStatsError(null);
      try {
        const [charResult, saveResult] = await Promise.all([
          supabase.from("personnage").select("experience").eq("id_utilisateur", user.id),
          supabase.from("sauvegarde").select("progression, id_aventure").eq("id_utilisateur", user.id),
        ]);

        if (cancelled) return;

        const characters = charResult.data ?? [];
        const saves = saveResult.data ?? [];

        setStats({
          charactersCount: characters.length,
          completedQuests: saves.filter((s) => (s.progression ?? 0) >= 100).length,
          totalXp: characters.reduce((sum, c) => sum + (c.experience ?? 0), 0),
        });

        const playedIds = saves.map((s) => s.id_aventure).filter(Boolean);
        const advQuery = supabase
          .from("aventure")
          .select("id, titre, description")
          .order("popularite", { ascending: false })
          .limit(3);

        if (playedIds.length > 0) {
          advQuery.not("id", "in", `(${playedIds.join(",")})`);
        }

        const { data: advData } = await advQuery;
        if (!cancelled) setSuggestions(advData ?? []);
      } catch (err) {
        console.error("[Dashboard] Erreur chargement:", err);
        setStatsError("Impossible de charger vos statistiques. Réessayez plus tard.");
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
          setLoadingSuggestions(false);
          setPullDistance(0);
          setPullState("idle");
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [user, refreshKey]);

  // Auth pas encore pret -> loader bloquant (normal)
  if (loading) {
    return <Loader fullScreen message="Chargement de votre espace..." />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Header />

      <main
        className="flex-1 relative pb-24 md:pb-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endPull}
      >
        {pullState !== "idle" && (
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center overflow-hidden transition-all duration-200"
            style={{ height: pullDistance }}
          >
            {pullState === "refreshing" ? (
              <Loader size="sm" message="" />
            ) : (
              <div className={`transition-transform duration-150 ${pullDistance >= 55 ? "rotate-180" : ""}`}>
                <ChevronDown className="w-6 h-6 text-cyan-400" />
              </div>
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-15"></div>

        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* En-tete */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              Bienvenue,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {user?.username || "Aventurier"}
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Pret a vivre de nouvelles aventures ?
            </p>
          </div>

          {/* Section personnages */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6 sticky top-16 md:top-20 z-20 bg-[#0a0e1a]/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Mes Personnages
              </h2>
              <button
                onClick={() => router.push("/create-character")}
                className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Creer un Personnage
              </button>
            </div>
            <CharacterList userId={user.id} />
          </div>

          {/* Statistiques */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 sticky top-16 md:top-20 z-20 bg-[#0a0e1a]/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
              Vos Statistiques
            </h2>

            {statsError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {statsError}
              </div>
            )}

            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#131e35] border border-gray-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 animate-pulse">
                    <div className="h-8 bg-gray-700/50 rounded w-12 mb-2" />
                    <div className="h-4 bg-gray-700/50 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-1 md:mb-2">
                    {stats.charactersCount}
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm">
                    Personnages
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1 md:mb-2">
                    {stats.completedQuests}
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm">Quetes</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 md:mb-2">
                    {stats.totalXp}
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm">
                    Points XP
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1 md:mb-2">
                    -
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm">
                    Niveau max
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {!loadingSuggestions && suggestions.length > 0 && (
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 sticky top-16 md:top-20 z-20 bg-[#0a0e1a]/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Pour Vous
              </h2>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {suggestions.map((adventure) => (
                  <div
                    key={adventure.id}
                    onClick={() => router.push(`/adventure/${adventure.id}`)}
                    className="bg-gradient-to-br from-[#0d1526] to-[#131929] border border-yellow-500/20 rounded-xl p-5 hover:border-yellow-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                        Recommande
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2 line-clamp-1">
                      {adventure.titre}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {adventure.description || "Une aventure palpitante vous attend..."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
