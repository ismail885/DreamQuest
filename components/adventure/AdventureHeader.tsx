"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";

interface AdventureHeaderProps {
  onBack: () => void;
  onRestart: () => void;
  isSaving: boolean;
}

export default function AdventureHeader({ onBack, onRestart, isSaving }: AdventureHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Retour
      </button>

      <div className="flex items-center gap-3">
        {isSaving && (
          <span className="flex items-center gap-1.5 text-xs text-cyan-400">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sauvegarde...
          </span>
        )}
        <button
          onClick={onRestart}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Recommencer
        </button>
      </div>
    </div>
  );
}
