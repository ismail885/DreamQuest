"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface LogEntry {
  id: string;
  type: "inscription" | "aventure_creee" | "vote" | "personnage_cree" | "connexion";
  description: string;
  userName?: string;
  adventureTitle?: string;
  timestamp: string;
}

export function useAdminLogs() {
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
      const [usersRes, adventuresRes, votesRes, charactersRes] =
        await Promise.all([
          supabase
            .from("utilisateur")
            .select("id, nom_utilisateur, date_creation")
            .order("date_creation", { ascending: false })
            .limit(20),
          supabase
            .from("aventure")
            .select("id, titre, date_creation, auteur_id")
            .order("date_creation", { ascending: false })
            .limit(20),
          supabase
            .from("vote")
            .select("id, date_vote, id_utilisateur, id_aventure")
            .order("date_vote", { ascending: false })
            .limit(20),
          supabase
            .from("personnage")
            .select("id, nom_personnage, date_creation, id_utilisateur")
            .order("date_creation", { ascending: false })
            .limit(20),
        ]);

      const authorIds = [
        ...new Set(
          (adventuresRes.data || [])
            .map((a) => a.auteur_id)
            .filter(Boolean),
        ),
      ];
      const { data: authors } = await supabase
        .from("utilisateur")
        .select("id, nom_utilisateur")
        .in("id", authorIds);
      const authorMap = new Map(
        (authors || []).map((a) => [a.id, a.nom_utilisateur]),
      );

      const voteUserIds = [
        ...new Set(
          (votesRes.data || [])
            .map((v) => v.id_utilisateur)
            .filter(Boolean),
        ),
      ];
      const { data: voteUsers } = await supabase
        .from("utilisateur")
        .select("id, nom_utilisateur")
        .in("id", voteUserIds);
      const voteUserMap = new Map(
        (voteUsers || []).map((u) => [u.id, u.nom_utilisateur]),
      );

      const logEntries: LogEntry[] = [];

      (usersRes.data || []).forEach((user) => {
        logEntries.push({
          id: `user-${user.id}`,
          type: "inscription",
          description: "Nouvel utilisateur inscrit",
          userName: user.nom_utilisateur,
          timestamp: user.date_creation,
        });
      });

      (adventuresRes.data || []).forEach((adventure) => {
        logEntries.push({
          id: `adventure-${adventure.id}`,
          type: "aventure_creee",
          description: "Nouvelle aventure créée",
          userName: adventure.auteur_id
            ? authorMap.get(adventure.auteur_id)
            : undefined,
          adventureTitle: adventure.titre,
          timestamp: adventure.date_creation,
        });
      });

      (votesRes.data || []).forEach((vote) => {
        logEntries.push({
          id: `vote-${vote.id}`,
          type: "vote",
          description: "Nouveau vote",
          userName: voteUserMap.get(vote.id_utilisateur),
          timestamp: vote.date_vote,
        });
      });

      (charactersRes.data || []).forEach((char) => {
        logEntries.push({
          id: `char-${char.id}`,
          type: "personnage_cree",
          description: "Personnage créé",
          userName: char.nom_personnage,
          timestamp: char.date_creation,
        });
      });

      logEntries.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime(),
      );

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

  const filteredLogs =
    filter === "all"
      ? logs
      : logs.filter((l) => l.type === filter);

  const stats = {
    total: logs.length,
    inscriptions: logs.filter((l) => l.type === "inscription").length,
    aventures: logs.filter((l) => l.type === "aventure_creee").length,
    votes: logs.filter((l) => l.type === "vote").length,
    personnages: logs.filter((l) => l.type === "personnage_cree")
      .length,
  };

  return {
    logs,
    filteredLogs,
    loading,
    isLive,
    lastUpdate,
    isRefreshing,
    filter,
    stats,
    setIsLive,
    setFilter,
    fetchLogs,
  };
}
