"use client";

import {
  Activity,
  Users,
  BookOpen,
  ThumbsUp,
  LogIn,
} from "lucide-react";
import type { LogEntry } from "@/hooks/admin/useAdminLogs";
import { useLanguage } from "@/context/LanguageContext";

interface AdminLogListProps {
  loading: boolean;
  entries: LogEntry[];
}

function getTypeIcon(type: LogEntry["type"]) {
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
}

function getTypeColor(type: LogEntry["type"]) {
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
}

export default function AdminLogList({
  loading,
  entries,
}: AdminLogListProps) {
  const { t } = useLanguage();

  function getTypeLabel(type: LogEntry["type"]) {
    switch (type) {
      case "inscription":
        return t("admin.logTypes.registration");
      case "aventure_creee":
        return t("admin.logTypes.adventure");
      case "vote":
        return t("admin.logTypes.vote");
      case "personnage_cree":
        return t("admin.logTypes.character");
      case "connexion":
        return t("admin.logTypes.login");
    }
  }

  function formatTimeAgo(timestamp: string) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("common.time.justNow");
    if (diffMins < 60) return t("common.time.minutesAgo").replace("{minutes}", String(diffMins));
    if (diffHours < 24) return t("common.time.hoursAgo").replace("{hours}", String(diffHours));
    if (diffDays < 7) {
      if (diffDays === 1) return t("common.time.daysAgo").replace("{days}", "1");
      return t("common.time.daysAgo_plural").replace("{days}", String(diffDays));
    }
    return then.toLocaleDateString("fr-FR");
  }

  return (
    <div className="card-base overflow-hidden">
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto" />
        </div>
      ) : entries.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          {t("admin.noRecentActivity")}
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {entries.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-cyan-500/10/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-card ${getTypeColor(log.type)}`}
                  >
                    {getTypeIcon(log.type)}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {log.userName && (
                        <span className="text-gray-400 text-sm">
                          {log.userName}
                        </span>
                      )}
                      {log.adventureTitle && (
                        <span className="text-purple-400 text-sm">
                          - {log.adventureTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(log.type)}`}
                  >
                    {getTypeLabel(log.type)}
                  </span>
                  <span className="text-gray-400 text-sm whitespace-nowrap">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
