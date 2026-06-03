"use client";

interface AdminLogFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "inscription", label: "Inscriptions" },
  { key: "aventure_creee", label: "Aventures", activeColor: "bg-purple-500" },
  { key: "vote", label: "Votes", activeColor: "bg-amber-500" },
  { key: "personnage_cree", label: "Personnages", activeColor: "bg-emerald-500" },
];

export default function AdminLogFilters({ filter, onFilterChange }: AdminLogFiltersProps) {
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === f.key
              ? `${f.activeColor || getActiveBg(f.key)} text-white`
              : "bg-surface border border-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
