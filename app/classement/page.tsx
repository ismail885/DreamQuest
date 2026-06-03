"use client";

import Link from "next/link";
import {
  Trophy,
  BookOpen,
  Users,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/shared/Header";
import BottomNav from "@/components/shared/BottomNav";
import PageBackground from "@/components/shared/PageBackground";
import PageTransition from "@/components/shared/PageTransition";
import Loader from "@/components/shared/Loader";
import { useAuthContext } from "@/context/AuthContext";
import { useClassementData } from "@/hooks/useClassementData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import RankingRow from "@/components/classement/RankingRow";
import ClassementTabs from "@/components/classement/ClassementTabs";

export default function ClassementPage() {
  const { user } = useAuthContext();
  const {
    activeTab,
    setActiveTab,
    adventures,
    players,
    loading,
    fetchError,
    refresh,
  } = useClassementData();
  const {
    pullDistance,
    pullState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh(refresh);

  return (
    <div className="min-h-screen text-white flex flex-col relative bg-deep">
      <PageBackground />

      <Header />

      <main
        className="flex-1 relative pb-24 md:pb-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pullState !== "idle" && (
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center overflow-hidden transition-all duration-200"
            style={{ height: pullDistance }}
          >
            {pullState === "refreshing" ? (
              <Loader size="sm" message="" />
            ) : (
              <div
                className={`transition-transform duration-150 ${pullDistance >= 55 ? "rotate-180" : ""}`}
              >
                <ChevronDown className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>
        )}

        <PageTransition className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 relative z-10">
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

            <ClassementTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {fetchError ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Erreur de chargement
                </h2>
                <p className="text-gray-400 ">{fetchError}</p>
              </div>
            ) : loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-400 mt-4">
                  Chargement du classement...
                </p>
              </div>
            ) : adventures.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  Aucun classement disponible
                </h2>
                <p className="text-gray-400 ">
                  Soyez le premier à créer une aventure !
                </p>
                {user && (
                  <Link
                    href="/create-character"
                    className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-primary to-[#3b82f6] text-white font-semibold rounded-[10px] hover:opacity-90 transition-opacity"
                  >
                    Créer une aventure
                  </Link>
                )}
              </div>
            ) : activeTab === "players" ? (
              players.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">
                    Aucun joueur
                  </h2>
                  <p className="text-gray-400 ">
                    Rejoignez la communauté pour apparaître !
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {players.map((player, index) => (
                    <RankingRow key={player.id} rank={index + 1}>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {player.nom_utilisateur}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {player.personnage_nom} ({player.classe}) — Niveau{" "}
                          {player.niveau ?? 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {player.experience ?? 0}
                        </div>
                        <div className="text-gray-500 text-xs">XP</div>
                      </div>
                    </RankingRow>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-4">
                {adventures.map((adventure, index) => (
                  <RankingRow
                    key={adventure.id}
                    rank={index + 1}
                    href={`/adventure/${adventure.id}`}
                  >
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
                      <div className="text-2xl font-bold text-primary">
                        {adventure.popularite}
                      </div>
                      <div className="text-gray-500 text-xs">votes</div>
                    </div>
                  </RankingRow>
                ))}
              </div>
            )}
          </div>
        </PageTransition>
      </main>

      <BottomNav />
    </div>
  );
}
