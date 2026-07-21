"use client";

import { Suspense } from "react";
import { RefreshCw, Wifi, WifiOff, Users, BookOpen, UserRound, Activity, TrendingUp, Calendar, ScrollText } from "lucide-react";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminRoleDistribution from "@/components/admin/AdminRoleDistribution";
import Loader from "@/components/shared/Loader";

export default function AdminDashboard() {
  const {
    stats, loading, error, isLive, lastUpdate, isRefreshing,
    setIsLive, fetchStats,
  } = useAdminDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Erreur de connexion</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => fetchStats(true)}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:shadow-glow text-white font-medium rounded-card transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader fullScreen />}>
    <div className="space-y-8">
      {/* Header with Live Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Administrateur</h1>
          <p className="text-gray-400 mt-1 sm:mt-2">Vue d&apos;ensemble de votre application</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-2 card-base">
            {isLive ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" />
            )}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`text-sm font-medium ${isLive ? "text-green-400" : "text-gray-500"}`}
            >
              {isLive ? "En direct" : "Hors ligne"}
            </button>
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="p-2 card-base hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      <p className="text-gray-400 text-sm">
        Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
      </p>

      {/* Stats Grid */}
      <AdminStatCards stats={stats} />

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminRoleDistribution stats={stats} />

        {/* Quick Actions */}
        <div className="card-base p-6">
          <h2 className="text-xl font-bold text-white mb-6">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/users" className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-card hover:bg-cyan-500/10 transition-all text-center">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Gérer utilisateurs</span>
            </a>
            <a href="/admin/adventures" className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-card hover:bg-cyan-500/10 transition-all text-center">
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Gérer aventures</span>
            </a>
            <a href="/admin/characters" className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-card hover:bg-cyan-500/10 transition-all text-center">
              <UserRound className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Gérer personnages</span>
            </a>
            <a href="/admin/logs" className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-card hover:bg-cyan-500/10 transition-all text-center">
              <ScrollText className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Logs</span>
            </a>
            <a href="/dashboard" className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-card hover:bg-cyan-500/10 transition-all text-center">
              <Activity className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Voir le site</span>
            </a>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card-base p-6">
        <h2 className="text-xl font-bold text-white mb-4">Informations système</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-card">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Statut</p>
              <p className="text-white font-medium">Opérationnel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-card">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Dernière mise à jour</p>
              <p className="text-white font-medium">{new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-card">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Version</p>
              <p className="text-white font-medium">DreamQuest v0.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}

