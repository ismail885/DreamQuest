"use client";

interface AdventureEndScreenProps {
  historyLength: number;
  characterNiveau?: number;
  onRestart: () => void;
}

export default function AdventureEndScreen({
  historyLength,
  characterNiveau,
  onRestart,
}: AdventureEndScreenProps) {
  return (
    <div className="text-center space-y-4 py-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30">
        <svg
          className="w-7 h-7 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="text-white font-bold text-xl">Aventure terminée !</p>
      <p className="text-gray-400 text-sm">
        Complétée en {historyLength} étape{historyLength > 1 ? "s" : ""}
      </p>
      {characterNiveau && characterNiveau > 1 && (
        <p className="text-yellow-400 font-semibold">
          Niveau {characterNiveau} atteint !
        </p>
      )}
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity"
      >
        Recommencer
      </button>
    </div>
  );
}
