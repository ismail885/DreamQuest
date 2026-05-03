"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, BookOpen, UserRound, TrendingUp, Activity, Calendar } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalAdventures: number;
  totalCharacters: number;
  totalVotes: number;
  adminCount: number;
  joueurCount: number;
  createurCount: number;
  recentUsers: number;
  recentAdventures: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAdventures: 0,
    totalCharacters: 0,
    totalVotes: 0,
    adminCount: 0,
    joueurCount: 0,
    createurCount: 0,
    recentUsers: 0,
    recentAdventures: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Run all queries in parallel for speed
      const [usersRes, adventuresRes, charactersRes, votesRes] = await Promise.all([
        supabase.from("utilisateur").select("role,date_creation", { count: "exact", head: true }),
        supabase.from("aventure").select("*", { count: "exact", head: true }),
        supabase.from("personnage").select("*", { count: "exact", head: true }),
        supabase.from("vote").select("*", { count: "exact", head: true }),
      ]);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString();

      // Process users data
      const usersCount = usersRes.count || 0;
      const recentUsersCount = usersRes.data?.filter(u => u.date_creation >= sevenDaysAgoStr).length || 0;
      
      const roleCounts = { admin: 0, joueur: 0, createur: 0 };
      usersRes.data?.forEach(u => {
        if (u.role === 'admin') roleCounts.admin++;
        else if (u.role === 'joueur') roleCounts.joueur++;
        else if (u.role === 'createur') roleCounts.createur++;
      });

      setStats({
        totalUsers: usersCount,
        totalAdventures: adventuresRes.count || 0,
        totalCharacters: charactersRes.count || 0,
        totalVotes: votesRes.count || 0,
        adminCount: roleCounts.admin,
        joueurCount: roleCounts.joueur,
        createurCount: roleCounts.createur,
        recentUsers: recentUsersCount,
        recentAdventures: 0, // Simplified
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      title: "Utilisateurs total",
      value: stats.totalUsers,
      icon: Users,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      subtitle: `${stats.recentUsers} cette semaine`,
    },
    {
      title: "Aventures",
      value: stats.totalAdventures,
      icon: BookOpen,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      subtitle: `${stats.recentAdventures} cette semaine`,
    },
    {
      title: "Personnages",
      value: stats.totalCharacters,
      icon: UserRound,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      subtitle: "Créés",
    },
    {
      title: "Votes",
      value: stats.totalVotes,
      icon: TrendingUp,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      subtitle: "Total",
    },
  ];

  const roleDistribution = [
    { role: "Joueurs", count: stats.joueurCount, color: "bg-cyan-500" },
    { role: "Créateurs", count: stats.createurCount, color: "bg-purple-500" },
    { role: "Administrateurs", count: stats.adminCount, color: "bg-red-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-content-primary">Dashboard Administrateur</h1>
        <p className="text-content-secondary mt-2">Vue d&apos;ensemble de votre application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-surface-tertiary border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-content-secondary text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-content-primary mt-2">{stat.value.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-2">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-surface-tertiary border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-content-primary mb-6">Distribution des rôles</h2>
          <div className="space-y-4">
            {roleDistribution.map((item, index) => {
              const percentage = stats.totalUsers > 0 ? (item.count / stats.totalUsers) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-content-secondary text-sm">{item.role}</span>
                    <span className="text-content-primary font-medium">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-tertiary border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-content-primary mb-6">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <span className="text-content-secondary text-sm">Gérer utilisateurs</span>
            </a>
            <a
              href="/admin/adventures"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <span className="text-content-secondary text-sm">Gérer aventures</span>
            </a>
            <a
              href="/admin/characters"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <UserRound className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span className="text-content-secondary text-sm">Gérer personnages</span>
            </a>
            <a
              href="/dashboard"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <Activity className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <span className="text-content-secondary text-sm">Voir le site</span>
            </a>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-surface-tertiary border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-content-primary mb-4">Informations système</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-content-secondary text-sm">Statut</p>
              <p className="text-content-primary font-medium">Opérationnel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-content-secondary text-sm">Dernière mise à jour</p>
              <p className="text-content-primary font-medium">{new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-content-secondary text-sm">Version</p>
              <p className="text-content-primary font-medium">DreamQuest v0.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}