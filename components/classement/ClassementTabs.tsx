"use client";

import { BookOpen, Users } from "lucide-react";

interface ClassementTabsProps {
  activeTab: "adventures" | "players";
  setActiveTab: (tab: "adventures" | "players") => void;
}

export default function ClassementTabs({
  activeTab,
  setActiveTab,
}: ClassementTabsProps) {
  return (
    <div
      className="flex justify-center gap-2 mb-8 sticky top-16 md:top-20 z-20 bg-deep/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4"
      role="tablist"
    >
      <button
        role="tab"
        aria-selected={activeTab === "adventures"}
        onClick={() => setActiveTab("adventures")}
        className={`px-4 py-2 rounded-card font-medium transition-all ${
          activeTab === "adventures"
            ? "bg-gradient-to-r from-primary to-blue-500 text-white"
            : "bg-transparent border border-cyan-500/20 text-gray-400 hover:border-cyan-500/40"
        }`}
      >
        <BookOpen className="w-4 h-4 inline mr-2" />
        Aventures
      </button>
      <button
        role="tab"
        aria-selected={activeTab === "players"}
        onClick={() => setActiveTab("players")}
        className={`px-4 py-2 rounded-card font-medium transition-all ${
          activeTab === "players"
            ? "bg-gradient-to-r from-primary to-blue-500 text-white"
            : "bg-transparent border border-cyan-500/20 text-gray-400 hover:border-cyan-500/40"
        }`}
      >
        <Users className="w-4 h-4 inline mr-2" />
        Joueurs
      </button>
    </div>
  );
}


