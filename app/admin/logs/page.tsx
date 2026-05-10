"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Activity, Users, BookOpen, ThumbsUp, RefreshCw, Wifi, WifiOff, LogIn } from "lucide-react";

interface LogEntry {
  id: string;
  type: "inscription" | "aventure_creee" | "vote" | "personnage_cree" | "connexion";
  description: string;
  userName?: string;
  adventureTitle?: string;
  timestamp: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) setIsRefreshing(true);
    try {
      // Fetch recent data from all tables
      const [
        usersRes,
        adventuresRes,
        votesRes,
        charactersRes
      ] = await Promise.all([
        supabase
          .from("utilisateur")
          .select("id_utilisateur, nom_utilisateur, date_creation")
          .order("date_creation", { ascending: false })
          .limit(20),
        supabase
          .from("aventure")
          .select("id_aventure, titre, date_creation, auteur_id")
          .order("date_creation", { ascending: false })
          .limit(20),
        supabase
          .from("vote")
          .select("id_vote, date_vote, id_utilisateur, id_aventure")
          .order("date_vote", { ascending: false })
          .limit(20),
        supabase
          .from("personnage")
          .select("id, nom_personnage, date_creation, id_utilisateur")
          .order("date_creation", { ascending: false })
          .limit(20),
      ]);

      // Fetch usernames for adventure authors
      const authorIds = [...new Set((adventuresRes.data || []).map(a => a.auteur_id).filter(Boolean))];
      const { data: authors } = await supabase
        .from("utilisateur")
        .select("id_utilisateur, nom_utilisateur")
        .in("id_utilisateur", authorIds);
      const authorMap = new Map((authors || []).map(a => [a.id_utilisateur, a.nom_utilisateur]));

      // Fetch usernames for votes
      const voteUserIds = [...new Set((votesRes.data || []).map(v => v.id_utilisateur).filter(Boolean))];
      const { data: voteUsers } = await supabase
        .from("utilisateur")
        .select("id_utilisateur, nom_utilisateur")
        .in("id_utilisateur", voteUserIds);
      const voteUserMap = new Map((voteUsers || []).map(u => [u.id_utilisateur, u.nom_utilisateur]));

      // Build log entries
      const logEntries: LogEntry[] = [];

      // Inscriptions
      (usersRes.data || []).forEach(user => {
        logEntries.push({
          id: `user-${user.id_utilisateur}`,
          type: "inscription",
          description: "Nouvel utilisateur inscrit",
          userName: user.nom_utilisateur,
          timestamp: user.date_creation,
        });
      });

      // Adventures created
      (adventuresRes.data || []).forEach(adventure => {
        logEntries.push({
          id: `adventure-${adventure.id_aventure}`,
          type: "aventure_creee",
          description: "Nouvelle aventure créée",
          userName: adventure.auteur_id ? authorMap.get(adventure.auteur_id) : undefined,
          adventureTitle: adventure.titre,
          timestamp: adventure.date_creation,
        });
      });

      // Votes
      (votesRes.data || []).forEach(vote => {
        logEntries.push({
          id: `vote-${vote.id_vote}`,
          type: "vote",
          description: "Nouveau vote",
          userName: voteUserMap.get(vote.id_utilisateur),
          timestamp: vote.date_vote,
        });
      });

      // Characters created
      (charactersRes.data || []).forEach(char => {
        logEntries.push({
          id: `char-${char.id}`,
          type: "personnage_cree",
          description: "Personnage créé",
          userName: char.nom_personnage,
          timestamp: char.date_creation,
        });
      });

      // Sort by timestamp descending
      logEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(logEntries.slice(0, 50));
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
      if (isAutoRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds if live mode is on
  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchLogs(true);
      }, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, fetchLogs]);

  const getTypeIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "inscription":
        return <Users className="w-4 h-4 text-cyan-400" />;
      case "aventure_creee":
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case "vote":
        return <ThumbsUp className="w-4 h-4 text-amber-400" />;
      case "personnage_cree":
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case "connexion":
        return <LogIn className="w-4 h-4 text-green-400" />;
    }
  };

  const getTypeLabel = (type: LogEntry["type"]) => {
    switch (type) {
      case "inscription":
        return "Inscription";
      case "aventure_creee":
        return "Aventure";
      case "vote":
        return "Vote";
      case "personnage_cree":
        return "Personnage";
      case "connexion":
        return "Connexion";
    }
  };

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "inscription":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "aventure_creee":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "vote":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "personnage_cree":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "connexion":
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return then.toLocaleDateString("fr-FR");
  };

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(l => l.type === filter);

  const stats = {
    total: logs.length,
    inscriptions: logs.filter(l => l.type === "inscription").length,
    aventures: logs.filter(l => l.type === "aventure_creee").length,
    votes: logs.filter(l => l.type === "vote").length,
    personnages: logs.filter(l => l.type === "personnage_cree").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-content-primary">Journal d&apos;activité</h1>
          <p className="text-content-secondary mt-2">Suivi des actions en temps réel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-tertiary border border-gray-800 rounded-lg">
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
            onClick={() => fetchLogs(true)}
            disabled={isRefreshing}
            className="p-2 bg-surface-tertiary border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-content-secondary ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      <p className="text-content-secondary text-sm -mt-4">
        Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface-tertiary border border-gray-800 rounded-lg p-4">
          <p className="text-content-secondary text-sm">Total</p>
          <p className="text-2xl font-bold text-content-primary">{stats.total}</p>
        </div>
        <div className="bg-surface-tertiary border border-gray-800 rounded-lg p-4">
          <p className="text-content-secondary text-sm">Inscriptions</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.inscriptions}</p>
        </div>
        <div className="bg-surface-tertiary border border-gray-800 rounded-lg p-4">
          <p className="text-content-secondary text-sm">Aventures</p>
          <p className="text-2xl font-bold text-purple-400">{stats.aventures}</p>
        </div>
        <div className="bg-surface-tertiary border border-gray-800 rounded-lg p-4">
          <p className="text-content-secondary text-sm">Votes</p>
          <p className="text-2xl font-bold text-amber-400">{stats.votes}</p>
        </div>
        <div className="bg-surface-tertiary border border-gray-800 rounded-lg p-4">
          <p className="text-content-secondary text-sm">Personnages</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.personnages}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-cyan-500 text-content-primary"
              : "bg-surface-tertiary border border-gray-800 text-content-secondary hover:text-content-primary"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter("inscription")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "inscription"
              ? "bg-cyan-500 text-content-primary"
              : "bg-surface-tertiary border border-gray-800 text-content-secondary hover:text-content-primary"
          }`}
        >
          Inscriptions
        </button>
        <button
          onClick={() => setFilter("aventure_creee")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "aventure_creee"
              ? "bg-purple-500 text-content-primary"
              : "bg-surface-tertiary border border-gray-800 text-content-secondary hover:text-content-primary"
          }`}
        >
          Aventures
        </button>
        <button
          onClick={() => setFilter("vote")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "vote"
              ? "bg-amber-500 text-content-primary"
              : "bg-surface-tertiary border border-gray-800 text-content-secondary hover:text-content-primary"
          }`}
        >
          Votes
        </button>
        <button
          onClick={() => setFilter("personnage_cree")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "personnage_cree"
              ? "bg-emerald-500 text-content-primary"
              : "bg-surface-tertiary border border-gray-800 text-content-secondary hover:text-content-primary"
          }`}
        >
          Personnages
        </button>
      </div>

      {/* Logs List */}
      <div className="bg-surface-tertiary border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-content-secondary">
            Aucune activité récente
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(log.type)}`}>
                      {getTypeIcon(log.type)}
                    </div>
                    <div>
                      <p className="text-content-primary font-medium">{log.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {log.userName && (
                          <span className="text-content-secondary text-sm">{log.userName}</span>
                        )}
                        {log.adventureTitle && (
                          <span className="text-purple-400 text-sm">- {log.adventureTitle}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(log.type)}`}>
                      {getTypeLabel(log.type)}
                    </span>
                    <span className="text-content-secondary text-sm whitespace-nowrap">
                      {formatTimeAgo(log.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}