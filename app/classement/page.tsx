"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Medal, BookOpen, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/shared/Header";
import BottomNav from "@/components/shared/BottomNav";
import { useAuthContext } from "@/context/AuthContext";

interface RankingAdventure {
  id: number;
  titre: string;
  description: string | null;
  popularite: number;
  auteur_nom?: string;
}

interface RankingPlayer {
  id: number;
  nom_utilisateur: string;
  personnage_nom: string;
  classe: string;
  niveau: number;
  experience: number;
}

export default function ClassementPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"adventures" | "players">("adventures");
  const [adventures, setAdventures] = useState<RankingAdventure[]>([]);
  const [players, setPlayers] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  useEffect(() => {
    setFetchError(null);
    const fetchRanking = async () => {
      setLoading(true);
      
      const query = supabase
        .from("aventure")
        .select(`
          id,
          titre,
          description,
          popularite,
          auteur:utilisateur(nom_utilisateur)
        `)
        .order("popularite", { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) {
        console.error("Erreur:", error);
        setFetchError("Impossible de charger le classement.");
      } else {
        const formatted = (data ?? []).map((a: Record<string, unknown>) => ({
          id: a.id as number,
          titre: a.titre as string,
          description: a.description as string | null,
          popularite: a.popularite as number,
          auteur_nom: ((a.auteur as Record<string, unknown>)?.[0] as Record<string, string> | undefined)?.nom_utilisateur 
            || (a.auteur as Record<string, string> | undefined)?.nom_utilisateur 
            || "Auteur inconnu",
        }));
        setAdventures(formatted);
      }
      setLoading(false);
    };

    const fetchPlayers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("personnage")
        .select(`
          id,
          nom_personnage,
          classe,
          niveau,
          experience,
          utilisateur!inner(id, nom_utilisateur)
        `)
        .order("niveau", { ascending: false })
        .order("experience", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Erreur:", error);
        setFetchError("Impossible de charger le classement des joueurs.");
      } else if (data) {
        const formatted = (data ?? []).map((p: Record<string, unknown>) => {
          const userData = (p.utilisateur as Record<string, unknown>);
          return {
            id: p.id as number,
            nom_utilisateur: (userData?.nom_utilisateur as string) || "Inconnu",
            personnage_nom: p.nom_personnage as string,
            classe: p.classe as string,
            niveau: p.niveau as number,
            experience: p.experience as number,
          };
        });
        setPlayers(formatted);
      }
      setLoading(false);
    };

    if (activeTab === "adventures") {
      fetchRanking();
    } else {
      fetchPlayers();
    }
  }, [activeTab]);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400";
      case 2: return "text-gray-300";
      case 3: return "text-amber-600";
      default: return "text-gray-500";
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Medal className="w-8 h-8 text-yellow-400" />;
      case 2: return <Medal className="w-8 h-8 text-gray-300" />;
      case 3: return <Medal className="w-8 h-8 text-amber-600" />;
      default: return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
              Classement
            </h1>
            <p className="text-gray-400 text-base md:text-lg">
              {activeTab === "adventures" 
                ? "Découvrez les aventures les plus populaires"
                : "Les meilleurs aventuriers du royaume"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab("adventures")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "adventures"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Aventures
            </button>
            <button
              onClick={() => setActiveTab("players")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "players"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Joueurs
            </button>
          </div>

          {fetchError ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
              <p className="text-gray-400">{fetchError}</p>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Chargement du classement...</p>
            </div>
          ) : adventures.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Aucun classement disponible</h2>
              <p className="text-gray-400">Soyez le premier à créer une aventure !</p>
              {user && (
                <Link
                  href="/create-character"
                  className="inline-block mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Créer une aventure
                </Link>
              )}
            </div>
          ) : activeTab === "players" ? (
            players.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Aucun joueur</h2>
                <p className="text-gray-400">Rejoignez la communauté pour apparaître !</p>
              </div>
            ) : (
              <div className="space-y-4">
                  {players.map((player, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 p-4 bg-[#0f1623] border border-gray-700/50 rounded-xl hover:border-cyan-500/50 transition-all"
                    >
                      <div className={`font-bold w-12 ${getMedalColor(rank)}`}>
                        {getMedalIcon(rank)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {player.nom_utilisateur}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {player.personnage_nom} ({player.classe}) — Niveau {player.niveau ?? 1}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">
                          {player.experience ?? 0}
                        </div>
                        <div className="text-gray-500 text-xs">XP</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {adventures.map((adventure, index) => {
                const rank = index + 1;
                return (
                  <Link
                    key={adventure.id}
                    href={`/adventure/${adventure.id}`}
                    className="flex items-center gap-4 p-4 bg-[#0f1623] border border-gray-700/50 rounded-xl hover:border-cyan-500/50 transition-all"
                  >
                    <div className={`font-bold w-12 ${getMedalColor(rank)}`}>
                      {getMedalIcon(rank)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">
                        {adventure.titre}
                      </h3>
                      {adventure.auteur_nom && (
                        <p className="text-gray-400 text-sm">
                          par {adventure.auteur_nom}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">
                        {adventure.popularite}
                      </div>
                      <div className="text-gray-500 text-xs">votes</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
