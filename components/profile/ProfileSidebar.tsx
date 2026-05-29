"use client";

import { useRouter } from "next/navigation";
import { getTotalXPForLevel, calculateRequiredXP } from "@/types";

interface ProfileSidebarProps {
  userProfile: {
    nom_utilisateur?: string;
    niveau?: number;
    experience?: number;
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
  const xpAtLevelStart =
    currentLevel > 1 ? getTotalXPForLevel(currentLevel) : 0;
  const xpInCurrentLevel = Math.max(0, currentExperience - xpAtLevelStart);
  const xpForNextLevel = calculateRequiredXP(currentLevel);
  const experiencePercentage =
    xpForNextLevel > 0
      ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100)
      : 0;

  return (
    <div className="lg:w-80 flex-shrink-0">
      <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-4 md:p-6">
        <div className="flex flex-col items-center mb-4 md:mb-6">
          <div className="w-16 md:w-24 h-16 md:h-24 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center text-white text-2xl md:text-3xl font-bold mb-3 md:mb-4 shadow-lg shadow-[rgba(6,182,212,0.3)]">
            {getUserInitials()}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {userProfile?.nom_utilisateur || "Aventurier"}
          </h2>
          <p className="text-gray-400 text-sm">
            Niveau {currentLevel} • Rang +
            {Math.floor(currentLevel * 3 + stats.likes / 100)}
          </p>
          <a
            href={`/profil/${userProfile?.nom_utilisateur}`}
            className="text-[#06b6d4] text-sm hover:underline mt-2"
          >
            Voir profil public
          </a>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Expérience</span>
            <span className="text-red-400 font-semibold">
              {Math.floor(xpInCurrentLevel).toLocaleString()} /{" "}
              {xpForNextLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-[#06b6d4] rounded-full transition-all duration-500"
              style={{ width: `${experiencePercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-2 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px]">
            <div className="text-2xl font-bold text-[#06b6d4]">
              {stats.storiesPlayed}
            </div>
            <div className="text-xs text-gray-400">Histoires</div>
          </div>
          <div className="text-center p-2 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px]">
            <div className="text-2xl font-bold text-[#06b6d4]">
              {stats.storiesCreated}
            </div>
            <div className="text-xs text-gray-400">Créées</div>
          </div>
          <div className="text-center p-2 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px]">
            <div className="text-2xl font-bold text-[#06b6d4]">
              {stats.likes}
            </div>
            <div className="text-xs text-gray-400">Likes</div>
          </div>
          <div className="text-center p-2 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px]">
            <div className="text-2xl font-bold text-[#06b6d4]">
              {stats.trophies}
            </div>
            <div className="text-xs text-gray-400">Trophées</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={openEditModal}
            className="w-full py-3 px-4 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px] text-white font-medium hover:bg-[rgba(6,182,212,0.05)] transition-colors flex items-center justify-center gap-2"
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
            className="w-full py-3 px-4 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px] text-white font-medium hover:bg-[rgba(6,182,212,0.05)] transition-colors flex items-center justify-center gap-2"
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
            className="w-full py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-[10px] text-red-400 font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-colors flex items-center justify-center gap-2"
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
