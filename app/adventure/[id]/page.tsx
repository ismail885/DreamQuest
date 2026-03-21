"use client";

import { use, Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/shared/Loader";
import { useAdventure } from "@/hooks/useAdventure";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import type { Character } from "@/types";

const ADVENTURE_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=500&fit=crop",
  2: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=500&fit=crop",
  3: "https://images.unsplash.com/photo-1589308078059-be1415eab064?w=1200&h=500&fit=crop",
  4: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&h=500&fit=crop",
  5: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=500&fit=crop",
  6: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&h=500&fit=crop",
};

const MAX_STEPS = 8;

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdventureDetailPage({ params }: Props) {
  return (
    <Suspense>
      <AdventureReader params={params} />
    </Suspense>
  );
}

function AdventureReader({ params }: Props) {
  const { id } = use(params);
  const adventureId = parseInt(id, 10);
  const router = useRouter();
  const searchParams = useSearchParams();
  const personnageId = searchParams.get("personnage");
  const { user } = useAuthContext();

  const [character, setCharacter] = useState<Character | null>(null);

  const { adventure, currentBranch, loading, error, isEnd, history, chooseOption, restart } =
    useAdventure(adventureId);

  const characterIdNum = personnageId ? parseInt(personnageId, 10) : null;
  const progression = Math.min(Math.round((history.length / MAX_STEPS) * 100), 100);

  const { isSaving, lastSaved, save } = useSave({
    userId: user?.id ?? null,
    adventureId: adventureId,
    characterId: characterIdNum,
    branchId: currentBranch?.id ?? null,
    progression,
    enabled: !!user && !!characterIdNum && !isEnd,
    intervalMs: 30_000,
  });

  useEffect(() => {
    if (!personnageId) return;
    supabase
      .from("personnage")
      .select("*")
      .eq("id_personnage", personnageId)
      .single()
      .then(({ data }) => {
        if (data) setCharacter(data as Character);
      });
  }, [personnageId]);

  useEffect(() => {
    if (isEnd && user && characterIdNum) {
      save();
    }
  }, [isEnd, user, characterIdNum, save]);

  const image = ADVENTURE_IMAGES[adventureId] ?? ADVENTURE_IMAGES[1];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={() => router.push("/adventure")}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
        >
          Retour aux aventures
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">

      {/* ── Barre du haut ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-[#131929] border border-gray-700 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <span className="text-gray-500 text-sm font-medium">
          Page de Lecture d&apos;histoire
        </span>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="flex items-center gap-1.5 text-xs text-cyan-400">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sauvegarde...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className="text-xs text-gray-500">
              Sauvegardé
            </span>
          )}
        </div>

        <button
          onClick={restart}
          className="flex items-center gap-2 px-4 py-2 bg-[#131929] border border-gray-700 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Recommencer
        </button>
      </div>

      {/* ── Stats personnage ── */}
      {character && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800/40">
          {/* Santé */}
          <div className="flex items-center gap-3 flex-1 bg-[#131929] border border-gray-800 rounded-xl px-4 py-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-gray-500 text-xs">Santé</p>
              <p className="text-white font-bold text-lg leading-none">{character.points_vie}</p>
            </div>
          </div>

          {/* Force */}
          <div className="flex items-center gap-3 flex-1 bg-[#131929] border border-gray-800 rounded-xl px-4 py-3">
            <svg className="w-6 h-6 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-gray-500 text-xs">Force</p>
              <p className="text-white font-bold text-lg leading-none">{character.stats?.force ?? 0}</p>
            </div>
          </div>

          {/* Intelligence */}
          <div className="flex items-center gap-3 flex-1 bg-[#131929] border border-gray-800 rounded-xl px-4 py-3">
            <svg className="w-6 h-6 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-gray-500 text-xs">Intelligence</p>
              <p className="text-white font-bold text-lg leading-none">{character.stats?.intelligence ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Contenu principal ── */}
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-5">

          {/* Barre de progression */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Progression de l&apos;histoire</span>
              <span className="text-gray-400 text-sm">{progression}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${progression}%` }}
              />
            </div>
          </div>

          {/* Image de l'aventure */}
          <div className="relative w-full h-52 rounded-xl overflow-hidden">
            <Image
              src={image}
              alt={adventure?.titre ?? "Aventure"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/50 to-transparent" />
          </div>

          {/* Texte de l'histoire */}
          {currentBranch && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
              <p className="text-gray-200 leading-relaxed text-base">
                {currentBranch.texte}
              </p>
            </div>
          )}

          {/* Fin de l'aventure */}
          {isEnd && (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-bold text-xl">Aventure terminée !</p>
              <p className="text-gray-400 text-sm">
                Complétée en {history.length} étape{history.length > 1 ? "s" : ""}
              </p>
              <button
                onClick={restart}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition-colors"
              >
                Recommencer
              </button>
            </div>
          )}

          {/* Choix */}
          {!isEnd && currentBranch && (
            <div className="space-y-3">
              {currentBranch.choix1 && currentBranch.choix1_lien && (
                <button
                  onClick={() => chooseOption(currentBranch.choix1_lien)}
                  className="w-full text-left px-5 py-4 bg-[#111827] border border-gray-700 hover:border-cyan-500/60 hover:bg-[#131929] rounded-xl text-gray-200 hover:text-white transition-all duration-200 text-sm leading-relaxed"
                >
                  {currentBranch.choix1}
                </button>
              )}
              {currentBranch.choix2 && currentBranch.choix2_lien && (
                <button
                  onClick={() => chooseOption(currentBranch.choix2_lien)}
                  className="w-full text-left px-5 py-4 bg-[#111827] border border-gray-700 hover:border-cyan-500/60 hover:bg-[#131929] rounded-xl text-gray-200 hover:text-white transition-all duration-200 text-sm leading-relaxed"
                >
                  {currentBranch.choix2}
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
