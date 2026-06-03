"use client";

import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useAdminLogs } from "@/hooks/admin/useAdminLogs";
import AdminLogStats from "@/components/admin/AdminLogStats";
import AdminLogFilters from "@/components/admin/AdminLogFilters";
import AdminLogList from "@/components/admin/AdminLogList";

export default function AdminLogsPage() {
  const {
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
  } = useAdminLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Journal d&apos;activité
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2">
            Suivi des actions en temps réel
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-gray-800 rounded-lg">
            {isLive ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" />
            )}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`text-sm font-medium ${
                isLive ? "text-green-400" : "text-gray-500"
              }`}
            >
              {isLive ? "En direct" : "Hors ligne"}
            </button>
          </div>
          <button
            onClick={() => fetchLogs(true)}
            disabled={isRefreshing}
            className="p-2 bg-surface border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>
      <p className="text-gray-400 text-sm">
        Dernière mise à jour:{" "}
        {lastUpdate.toLocaleTimeString("fr-FR")}
      </p>

      {/* Stats */}
      <AdminLogStats stats={stats} />

      {/* Filters */}
      <AdminLogFilters filter={filter} onFilterChange={setFilter} />

      {/* Logs List */}
      <AdminLogList loading={loading} entries={filteredLogs} />
    </div>
  );
}

