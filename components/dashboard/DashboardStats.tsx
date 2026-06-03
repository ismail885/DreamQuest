"use client";

import { UserStats } from "@/hooks/useDashboardData";

interface DashboardStatsProps {
  stats: UserStats;
  loading: boolean;
  error: string | null;
}

export default function DashboardStats({ stats, loading, error }: DashboardStatsProps) {
  return (
    <div className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 sticky top-16 md:top-20 z-20 bg-deep/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
        Vos Statistiques
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-surface-card border border-gray-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 animate-pulse"
            >
              <div className="h-8 bg-gray-700/50 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-700/50 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-1 md:mb-2">
              {stats.charactersCount}
            </div>
            <div className="text-gray-400 text-xs md:text-sm">Personnages</div>
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
            <div className="text-gray-400 text-xs md:text-sm">Points XP</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1 md:mb-2">
              {stats.maxLevel > 0 ? stats.maxLevel : "—"}
            </div>
            <div className="text-gray-400 text-xs md:text-sm">Niveau max perso</div>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="text-2xl md:text-3xl font-bold text-violet-400 mb-1 md:mb-2">
              {stats.userLevel}
            </div>
            <div className="text-gray-400 text-xs md:text-sm">Niveau utilisateur</div>
          </div>
        </div>
      )}
    </div>
  );
}
