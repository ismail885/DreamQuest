"use client";

import { useRouter } from "next/navigation";
import {
  getXPInCurrentLevel,
  getXPForNextLevel,
  getPrestigeTitle,
} from "@/lib/leveling";
import { getSeasonById, MAX_LEVEL } from "@/lib/seasons";

interface ProfileSidebarProps {
  userProfile: {
    nom_utilisateur?: string;
    niveau?: number;
    experience?: number;
    saison_actuelle?: number;
    meilleur_niveau?: number;
  } | null;
  stats: {
    storiesPlayed: number;
    storiesCreated: number;
    likes: number;
    trophies: number;
  };
  getUserInitials: () => string;
  openEditModal: () => void;
  openSettingsModal: () => void;
  logout: () => Promise<void>;
}

export default function ProfileSidebar({
  userProfile,
  stats,
  getUserInitials,
  openEditModal,
  openSettingsModal,
  logout,
}: ProfileSidebarProps) {
  const router = useRouter();

  const currentLevel = userProfile?.niveau || 1;
  const currentExperience = userProfile?.experience || 0;
  const bestLevel = userProfile?.meilleur_niveau || currentLevel;
  const seasonId = userProfile?.saison_actuelle || 1;
  const season = getSeasonById(seasonId);
  const prestigeTitle = getPrestigeTitle(bestLevel);

  const xpInCurrentLevel = getXPInCurrentLevel(currentLevel, currentExperience);
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const isMaxLevel = currentLevel >= MAX_LEVEL;
  const experiencePercentage =
    !isMaxLevel && xpForNextLevel > 0
      ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100)
      : 100;

  return (
    <div className="lg:w-80 flex-shrink-0">
      <div className="card-base p-4 md:p-6">
        <div className="mb-4 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/20 text-center">
          <p className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold">
            Saison {seasonId}
          </p>
          <p className="text-sm font-semibold text-white">
            {season?.name ?? "Inconnue"}
          </p>
          {season && season.xpMultiplier !== 1.0 && (
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold text-green-300 bg-green-500/20 border border-green-500/30 rounded-full">
              +{Math.round((season.xpMultiplier - 1) * 100)}% XP
            </span>
          )}
        </div>

        <div className="flex flex-col items-center mb-4 md:mb-6">
          <div className="w-16 md:w-24 h-16 md:h-24 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold mb-3 md:mb-4 shadow-lg shadow-cyan-500/30">
            {getUserInitials()}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {userProfile?.nom_utilisateur || "Aventurier"}
          </h2>
          <p className="text-gray-400 text-sm">
            Niveau {currentLevel}/{MAX_LEVEL}
          </p>
          <p className="text-yellow-400 text-xs font-medium">
            {prestigeTitle}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            Meilleur : Niveau {bestLevel}
          </p>
          <a
            href={`/profil/${userProfile?.nom_utilisateur}`}
            className="text-primary text-sm hover:underline mt-2"
          >
            Voir profil public
          </a>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Expérience</span>
            <span className="text-red-400 font-semibold">
              {isMaxLevel
                ? "MAX"
                : `${Math.floor(xpInCurrentLevel).toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isMaxLevel
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gradient-to-r from-red-500 to-primary"
              }`}
              style={{ width: `${experiencePercentage}%` }}
            />
          </div>
          {isMaxLevel && (
            <p className="text-yellow-400 text-xs text-center mt-1 font-semibold">
              Niveau maximum atteint !
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-2 bg-transparent border border-cyan-500/20 rounded-card">
            <div className="text-2xl font-bold text-primary">
              {stats.storiesPlayed}
            </div>
            <div className="text-xs text-gray-400">Histoires</div>
          </div>
          <div className="text-center p-2 bg-transparent border border-cyan-500/20 rounded-card">
            <div className="text-2xl font-bold text-primary">
              {stats.storiesCreated}
            </div>
            <div className="text-xs text-gray-400">Créées</div>
          </div>
          <div className="text-center p-2 bg-transparent border border-cyan-500/20 rounded-card">
            <div className="text-2xl font-bold text-primary">
              {stats.likes}
            </div>
            <div className="text-xs text-gray-400">Likes</div>
          </div>
          <div className="text-center p-2 bg-transparent border border-cyan-500/20 rounded-card">
            <div className="text-2xl font-bold text-primary">
              {stats.trophies}
            </div>
            <div className="text-xs text-gray-400">Trophées</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={openEditModal}
            className="w-full py-3 px-4 bg-transparent border border-cyan-500/20 rounded-card text-white font-medium hover:bg-cyan-500/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Modifier le profil
          </button>
          <button
            onClick={openSettingsModal}
            className="w-full py-3 px-4 bg-transparent border border-cyan-500/20 rounded-card text-white font-medium hover:bg-cyan-500/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Paramètres
          </button>
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="w-full py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-card text-red-400 font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}





