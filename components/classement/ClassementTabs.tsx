"use client";

import { BookOpen, Users } from "lucide-react";

interface ClassementTabsProps {
  activeTab: "adventures" | "players";
  setActiveTab: (tab: "adventures" | "players") => void;
}

export default function ClassementTabs({ activeTab, setActiveTab }: ClassementTabsProps) {
  return (
    <div className="flex justify-center gap-2 mb-8 sticky top-16 md:top-20 z-20 bg-[#070b15]/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
      <button
        onClick={() => setActiveTab("adventures")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === "adventures"
            ? "bg-cyan-500 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }`}
      >
        <BookOpen className="w-4 h-4 inline mr-2" />
        Aventures
      </button>
      <button
        onClick={() => setActiveTab("players")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === "players"
            ? "bg-cyan-500 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }`}
      >
        <Users className="w-4 h-4 inline mr-2" />
        Joueurs
      </button>
    </div>
  );
}
