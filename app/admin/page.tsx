"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get user counts
        const { count: totalUsers } = await supabase
          .from("utilisateur")
          .select("*", { count: "exact", head: true });

        const { count: adminCount } = await supabase
          .from("utilisateur")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");

        const { count: joueurCount } = await supabase
          .from("utilisateur")
          .select("*", { count: "exact", head: true })
          .eq("role", "joueur");

        const { count: createurCount } = await supabase
          .from("utilisateur")
          .select("*", { count: "exact", head: true })
          .eq("role", "createur");

        // Get adventure count
        const { count: totalAdventures } = await supabase
          .from("aventure")
          .select("*", { count: "exact", head: true });

        // Get character count
        const { count: totalCharacters } = await supabase
          .from("personnage")
          .select("*", { count: "exact", head: true });

        // Get vote count
        const { count: totalVotes } = await supabase
          .from("vote")
          .select("*", { count: "exact", head: true });

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: recentUsers } = await supabase
          .from("utilisateur")
          .select("*", { count: "exact", head: true })
          .gte("date_creation", sevenDaysAgo.toISOString());

        // Get recent adventures (last 7 days)
        const { count: recentAdventures } = await supabase
          .from("aventure")
          .select("*", { count: "exact", head: true })
          .gte("date_creation", sevenDaysAgo.toISOString());

        setStats({
          totalUsers: totalUsers || 0,
          totalAdventures: totalAdventures || 0,
          totalCharacters: totalCharacters || 0,
          totalVotes: totalVotes || 0,
          adminCount: adminCount || 0,
          joueurCount: joueurCount || 0,
          createurCount: createurCount || 0,
          recentUsers: recentUsers || 0,
          recentAdventures: recentAdventures || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
        <h1 className="text-3xl font-bold text-white">Dashboard Administrateur</h1>
        <p className="text-gray-400 mt-2">Vue d&apos;ensemble de votre application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[#1a1f2e] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value.toLocaleString()}</p>
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
        <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Distribution des rôles</h2>
          <div className="space-y-4">
            {roleDistribution.map((item, index) => {
              const percentage = stats.totalUsers > 0 ? (item.count / stats.totalUsers) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">{item.role}</span>
                    <span className="text-white font-medium">{item.count}</span>
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
        <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Gérer utilisateurs</span>
            </a>
            <a
              href="/admin/adventures"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Gérer aventures</span>
            </a>
            <a
              href="/admin/characters"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <UserRound className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Gérer personnages</span>
            </a>
            <a
              href="/dashboard"
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all text-center"
            >
              <Activity className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">Voir le site</span>
            </a>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Informations système</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Statut</p>
              <p className="text-white font-medium">Opérationnel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Dernière mise à jour</p>
              <p className="text-white font-medium">{new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
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
  );
}