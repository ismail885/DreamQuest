"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, BookOpen, UserRound, TrendingUp, Activity, Calendar, Wifi, WifiOff, RefreshCw } from "lucide-react";

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
 activeUsersToday: number;
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
 activeUsersToday: 0,
 });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [isLive, setIsLive] = useState(true);
 const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
 const [isRefreshing, setIsRefreshing] = useState(false);
 const intervalRef = useRef<NodeJS.Timeout | null>(null);

 const fetchStats = useCallback(async (isAutoRefresh = false) => {
 if (isAutoRefresh) setIsRefreshing(true);
 setError(null);
 try {
 // Run all queries in parallel for speed
 const [usersRes, adventuresRes, charactersRes, votesRes, recentAdvRes] = await Promise.all([
 supabase.from("utilisateur").select("role,date_creation", { count: "exact", head: false }),
 supabase.from("aventure").select("*", { count: "exact", head: true }),
 supabase.from("personnage").select("*", { count: "exact", head: true }),
 supabase.from("vote").select("*", { count: "exact", head: true }),
 supabase.from("aventure").select("date_creation", { count: "exact", head: false }),
 ]);

 const sevenDaysAgo = new Date();
 sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
 const sevenDaysAgoStr = sevenDaysAgo.toISOString();

 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const todayStr = today.toISOString();

 const usersCount = usersRes.count || 0;
 const recentUsersCount = usersRes.data?.filter(u => u.date_creation >= sevenDaysAgoStr).length || 0;
 const activeTodayCount = usersRes.data?.filter(u => u.date_creation >= todayStr).length || 0;
 const recentAdventuresCount = recentAdvRes.data?.filter(a => a.date_creation >= sevenDaysAgoStr).length || 0;
 
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
 recentAdventures: recentAdventuresCount,
 activeUsersToday: activeTodayCount,
 });
 setLastUpdate(new Date());
 } catch (error) {
 console.error("Error fetching stats:", error);
 setError("Impossible de charger les statistiques. Vérifiez votre connexion à la base de données.");
 } finally {
 setLoading(false);
 if (isAutoRefresh) setIsRefreshing(false);
 }
 }, []);

 useEffect(() => {
 fetchStats();
 }, [fetchStats]);

 // Auto-refresh every 30 seconds if live mode is on
 useEffect(() => {
 if (isLive) {
 intervalRef.current = setInterval(() => {
 fetchStats(true);
 }, 30000);
 }
 return () => {
 if (intervalRef.current) clearInterval(intervalRef.current);
 };
 }, [isLive, fetchStats]);

 const toggleLive = () => {
 setIsLive(!isLive);
 };

 const handleManualRefresh = () => {
 fetchStats(true);
 };

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
 {
 title: "Aujourd'hui",
 value: stats.activeUsersToday,
 icon: Activity,
 color: "text-green-400",
 bgColor: "bg-green-500/10",
 subtitle: "Nouveaux aujourd'hui",
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
 <p className="text-gray-400 ">{error}</p>
 <button
 onClick={handleManualRefresh}
 className="mt-6 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
 >
 Réessayer
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-8">
 {/* Header with Live Controls */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-white ">Dashboard Administrateur</h1>
 <p className="text-gray-400 mt-2">Vue d&apos;ensemble de votre application</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 px-3 py-2 bg-[#0c1322] border border-gray-800 rounded-lg">
 {isLive ? (
 <Wifi className="w-4 h-4 text-green-400" />
 ) : (
 <WifiOff className="w-4 h-4 text-gray-500" />
 )}
 <button
 onClick={toggleLive}
 className={`text-sm font-medium ${isLive ? "text-green-400" : "text-gray-500"}`}
 >
 {isLive ? "En direct" : "Hors ligne"}
 </button>
 </div>
 <button
 onClick={handleManualRefresh}
 disabled={isRefreshing}
 className="p-2 bg-[#0c1322] border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
 >
 <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? "animate-spin" : ""}`} />
 </button>
 </div>
 </div>
 <p className="text-gray-400 text-sm -mt-4">
 Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
 </p>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
 {statCards.map((stat, index) => {
 const Icon = stat.icon;
 return (
 <div
 key={index}
 className="bg-[#0c1322] border border-gray-800 rounded-xl p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
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
 <div className="bg-[#0c1322] border border-gray-800 rounded-xl p-6">
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
 <div className="bg-[#0c1322] border border-gray-800 rounded-xl p-6">
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
 <div className="bg-[#0c1322] border border-gray-800 rounded-xl p-6">
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

