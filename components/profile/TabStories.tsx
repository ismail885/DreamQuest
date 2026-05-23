"use client";

import { useRouter } from "next/navigation";
import type { UserSave } from "@/types/save";

interface TabStoriesProps {
  saves: UserSave[];
}

export default function TabStories({ saves }: TabStoriesProps) {
  const router = useRouter();

  if (saves.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune histoire jouée</h3>
        <p className="text-gray-400 mb-4">Commencez une aventure pour voir votre progression ici.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
        >
          Découvrir les aventures
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saves.map((save) => (
        <div
          key={save.id}
          className="bg-[#0c1322] border border-gray-700/30 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-white">{save.aventure_titre}</h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${
                save.status === "completed"
                  ? "border-green-500/50 text-green-400 bg-green-500/10"
                  : "border-orange-500/50 text-orange-400 bg-orange-500/10"
              }`}
            >
              {save.status === "completed" ? "Complétée" : "En cours"}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-sm text-gray-400">Progression : {save.progression}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                save.status === "completed"
                  ? "bg-gradient-to-r from-cyan-500 to-green-500"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
              }`}
              style={{ width: `${save.progression}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
