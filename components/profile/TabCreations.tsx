"use client";

import type { UserCreation } from "@/types/adventure";

interface TabCreationsProps {
  creations: UserCreation[];
}

export default function TabCreations({ creations }: TabCreationsProps) {
  if (creations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune création</h3>
        <p className="text-gray-400 mb-4">Créez votre première aventure pour la voir apparaître ici.</p>
        <button
          onClick={() => window.location.href = "/create-adventure"}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
        >
          Créer une aventure
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {creations.map((creation) => (
        <div
          key={creation.id}
          className="bg-surface border border-gray-700/30 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-white">{creation.titre}</h3>
            <div className="flex items-center gap-1 text-cyan-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-sm">{creation.popularite}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
