"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AdventureHeaderProps {
  onBack: () => void;
  onRestart: () => void;
  isSaving: boolean;
}

export default function AdventureHeader({ onBack, onRestart, isSaving }: AdventureHeaderProps) {
  return (
    <nav className="border-b border-gray-800/50 backdrop-blur-sm bg-deep/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
            <Image src="/Logo_DreamQuest.png" alt="DreamQuest" width={32} height={32} className="object-contain w-8 h-8 md:w-10 md:h-10" />
            <span className="hidden sm:inline text-lg md:text-xl font-bold text-cyan-400">DreamQuest</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Retour
            </button>

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
      </div>
    </nav>
  );
}
