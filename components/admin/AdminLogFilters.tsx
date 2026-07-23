"use client";

import { useLanguage } from "@/context/LanguageContext";

interface AdminLogFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function AdminLogFilters({ filter, onFilterChange }: AdminLogFiltersProps) {
  const { t } = useLanguage();
  const FILTERS = [
    { key: "all", label: t("admin.logFilters.all") },
    { key: "inscription", label: t("admin.logFilters.registrations") },
    { key: "aventure_creee", label: t("admin.logFilters.adventures"), activeColor: "bg-purple-500" },
    { key: "vote", label: t("admin.logFilters.votes"), activeColor: "bg-amber-500" },
    { key: "personnage_cree", label: t("admin.logFilters.characters"), activeColor: "bg-emerald-500" },
  ];

  const getActiveBg = (key: string) => {
    if (key === "all") return "bg-cyan-500";
    return "bg-cyan-500";
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={`px-4 py-2 rounded-card text-sm font-medium transition-colors ${
            filter === f.key
              ? `${f.activeColor || getActiveBg(f.key)} text-white`
              : "bg-surface border border-cyan-500/15 text-gray-400 hover:text-white"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
