"use client";

import { use, Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/shared/Loader";
import { useAdventure } from "@/hooks/useAdventure";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import type { Character, ConsequenceEffect } from "@/types";
import { LEVEL_BONUS, RANDOM_EVENTS, ABILITIES_POOL, getRandomEvent } from "@/lib/randomGenerator";
import { motion } from "framer-motion";
import type { CharacterClass } from "@/types";

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
  const [lastConsequence, setLastConsequence] = useState<ConsequenceEffect | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<typeof RANDOM_EVENTS[0] | null>(null);
  const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
  const [usedAbilities, setUsedAbilities] = useState<string[]>([]);

  // Parse consequence JSON to show impact indicator
  const getConsequenceImpact = (consequencesJson: string | null | undefined): { hasImpact: boolean; isPositive: boolean; impactText: string } => {
    if (!consequencesJson) return { hasImpact: false, isPositive: true, impactText: "" };
    
    try {
      const effect = JSON.parse(consequencesJson);
      if (!effect || (effect.pv === 0 && !effect.force && !effect.agility && !effect.intelligence && !effect.endurance)) {
        return { hasImpact: false, isPositive: true, impactText: "" };
      }
      
      const impacts: string[] = [];
      let isPositive = true;
      
      if (effect.pv) { impacts.push(`${effect.pv > 0 ? '+' : ''}${effect.pv} PV`); if (effect.pv < 0) isPositive = false; }
      if (effect.force) { impacts.push(`${effect.force > 0 ? '+' : ''}${effect.force} Force`); if (effect.force < 0) isPositive = false; }
      if (effect.agility) { impacts.push(`${effect.agility > 0 ? '+' : ''}${effect.agility} Agilité`); if (effect.agility < 0) isPositive = false; }
      if (effect.intelligence) { impacts.push(`${effect.intelligence > 0 ? '+' : ''}${effect.intelligence} Intelligence`); if (effect.intelligence < 0) isPositive = false; }
      if (effect.endurance) { impacts.push(`${effect.endurance > 0 ? '+' : ''}${effect.endurance} Endurance`); if (effect.endurance < 0) isPositive = false; }
      
      return { hasImpact: impacts.length > 0, isPositive, impactText: impacts.join(" • ") };
    } catch {
      return { hasImpact: false, isPositive: true, impactText: "" };
    }
  };

  const applyConsequence = async (choixNum: 1 | 2, consequencesJson: string | null | undefined) => {
    if (!character || !consequencesJson) return;
    
    try {
      const effect = JSON.parse(consequencesJson);
      if (!effect) return;

      const newStats = {
        force: (character.stats?.force ?? 0) + (effect.force ?? 0),
        agility: (character.stats?.agility ?? 0) + (effect.agility ?? 0),
        intelligence: (character.stats?.intelligence ?? 0) + (effect.intelligence ?? 0),
        endurance: (character.stats?.endurance ?? 0) + (effect.endurance ?? 0),
      };
      const newPv = Math.max(0, (character.points_vie ?? 0) + (effect.pv ?? 0));

      if (character.id) {
        await supabase.from('personnage').update({
          points_vie: newPv,
        }).eq('id', character.id);
      }

      setCharacter({
        ...character,
        points_vie: newPv,
        stats: newStats,
      });

      setLastConsequence({
        pv_change: effect.pv,
        force_change: effect.force,
        agility_change: effect.agility,
        intelligence_change: effect.intelligence,
        endurance_change: effect.endurance,
        text: effect.text,
      });
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 3000);
    } catch {
      // Si JSON invalide, on ignore
    }
  };

  const { adventure, currentBranch, loading, error, isEnd, history, chooseOption, restart } =
    useAdventure(adventureId, user?.id ?? null);

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
      .eq("id", personnageId)
      .single()
      .then(({ data }) => {
        if (data) setCharacter(data as Character);
      });
  }, [personnageId]);

  // Charger les abilities du personnage lors du chargement
  useEffect(() => {
    if (!character?.classe) return;
    const classAbilities = ABILITIES_POOL[character.classe as CharacterClass] || [];
    // Sélectionner les 3 premières abilities comme disponibles
    setAvailableAbilities(classAbilities.slice(0, 3));
  }, [character?.classe]);

  // Déclencher un événement aléatoire (15% de chance)
  useEffect(() => {
    if (!currentBranch || currentEvent || isEnd) return;
    
    const shouldTrigger = Math.random() < 0.15;
    if (shouldTrigger) {
      const event = getRandomEvent();
      setCurrentEvent(event);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch?.id, currentEvent, isEnd]);

  const loadCharacterProgress = useCallback(() => {
    if (!user || !characterIdNum) return null;
    const key = `dq_char_${user.id}_${characterIdNum}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  }, [user, characterIdNum]);

  const saveCharacterProgress = useCallback((niveau: number, stats: { force: number; agility: number; intelligence: number; endurance: number }, experience: number) => {
    if (!user || !characterIdNum) return;
    const key = `dq_char_${user.id}_${characterIdNum}`;
    localStorage.setItem(key, JSON.stringify({ niveau, stats, experience, updatedAt: new Date().toISOString() }));
  }, [user, characterIdNum]);

  useEffect(() => {
    if (isEnd && user && characterIdNum && character) {
      save();
      const progress = loadCharacterProgress() || { niveau: character.niveau ?? 1, stats: { force: 5, agility: 5, intelligence: 5, endurance: 5 }, experience: 0 };
      const xpGained = history.length * 50;
      const newExperience = progress.experience + xpGained;
      const newLevel = Math.min(Math.floor(newExperience / 500) + 1, 10);
      const bonus = LEVEL_BONUS[newLevel] || {};
      const newStats = {
        force: (progress.stats?.force ?? 5) + (bonus.force ?? 0),
        agility: (progress.stats?.agility ?? 5) + (bonus.agility ?? 0),
        intelligence: (progress.stats?.intelligence ?? 5) + (bonus.intelligence ?? 0),
        endurance: (progress.stats?.endurance ?? 5) + (bonus.endurance ?? 0),
      };
      if (newLevel > progress.niveau) {
        supabase.from('personnage').update({ niveau: newLevel }).eq('id', characterIdNum).then();
      }
      saveCharacterProgress(newLevel, newStats, newExperience);
      setCharacter(prev => prev ? {
        ...prev,
        niveau: newLevel,
        stats: newStats,
        experience: newExperience,
      } : prev);
    }
  }, [isEnd, user, characterIdNum, character, save, history.length, loadCharacterProgress, saveCharacterProgress]);

  const image = ADVENTURE_IMAGES[adventureId] ?? ADVENTURE_IMAGES[1];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={() => router.push("/adventure")}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-content-primary rounded-lg font-medium transition-colors"
        >
          Retour aux aventures
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-surface-tertiary border border-gray-700 hover:border-gray-500 rounded-lg text-content-secondary hover:text-content-primary transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <span className="text-content-secondary text-sm font-medium">
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
            <span className="text-xs text-content-secondary">
              Sauvegardé
            </span>
          )}
        </div>

        <button
          onClick={async () => {
            await save();
            router.back();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/50 hover:bg-green-600/30 rounded-lg text-green-400 hover:text-green-300 transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Sauvegarder & Quitter
        </button>
      </div>

      {showEffect && lastConsequence && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gray-900 border border-cyan-500/50 rounded-xl px-4 py-3 shadow-lg shadow-cyan-500/20">
            <p className="text-cyan-400 text-sm font-semibold text-center mb-2">Impact du choix</p>
            <div className="flex gap-3 text-xs">
              {lastConsequence.pv_change !== undefined && lastConsequence.pv_change !== 0 && (
                <span className={lastConsequence.pv_change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {lastConsequence.pv_change > 0 ? '+' : ''}{lastConsequence.pv_change} PV
                </span>
              )}
              {lastConsequence.force_change !== undefined && lastConsequence.force_change !== 0 && (
                <span className={lastConsequence.force_change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {lastConsequence.force_change > 0 ? '+' : ''}{lastConsequence.force_change} Force
                </span>
              )}
              {lastConsequence.agility_change !== undefined && lastConsequence.agility_change !== 0 && (
                <span className={lastConsequence.agility_change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {lastConsequence.agility_change > 0 ? '+' : ''}{lastConsequence.agility_change} Agilité
                </span>
              )}
              {lastConsequence.intelligence_change !== undefined && lastConsequence.intelligence_change !== 0 && (
                <span className={lastConsequence.intelligence_change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {lastConsequence.intelligence_change > 0 ? '+' : ''}{lastConsequence.intelligence_change} Intelligence
                </span>
              )}
              {lastConsequence.endurance_change !== undefined && lastConsequence.endurance_change !== 0 && (
                <span className={lastConsequence.endurance_change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {lastConsequence.endurance_change > 0 ? '+' : ''}{lastConsequence.endurance_change} Endurance
                </span>
              )}
            </div>
            {lastConsequence.text && (
              <p className="text-content-secondary text-xs mt-2 text-center">{lastConsequence.text}</p>
            )}
          </div>
        </div>
      )}

      {character && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800/40">
          <div className="flex items-center gap-3 flex-1 bg-surface-tertiary border border-gray-800 rounded-xl px-4 py-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-content-secondary text-xs">Santé</p>
              <p className="text-content-primary font-bold text-lg leading-none">{character.points_vie}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 bg-surface-tertiary border border-gray-800 rounded-xl px-4 py-3">
            <svg className="w-6 h-6 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-content-secondary text-xs">Force</p>
              <p className="text-content-primary font-bold text-lg leading-none">{character.stats?.force ?? 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 bg-surface-tertiary border border-gray-800 rounded-xl px-4 py-3">
            <svg className="w-6 h-6 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-content-secondary text-xs">Intelligence</p>
              <p className="text-content-primary font-bold text-lg leading-none">{character.stats?.intelligence ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-content-secondary text-sm">
                {isEnd ? 'Aventure terminée' : `Étape ${history.length + 1} sur ${MAX_STEPS}`}
              </span>
              <span className="text-content-secondary text-sm">{progression}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${progression}%` }}
              />
            </div>
          </div>

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

          {currentBranch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-surface-tertiary border border-gray-800 rounded-xl p-6"
            >
              <p className="text-content-secondary leading-relaxed text-base">
                {currentBranch.texte}
              </p>
            </motion.div>
          )}

          {isEnd && (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-content-primary font-bold text-xl">Aventure terminée !</p>
              <p className="text-content-secondary text-sm">
                Complétée en {history.length} étape{history.length > 1 ? "s" : ""}
              </p>
              {character && character.niveau > 1 && (
                <p className="text-yellow-400 font-semibold">
                  Niveau {character.niveau} atteint !
                </p>
              )}
              <button
                onClick={restart}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-content-primary rounded-lg font-semibold transition-colors"
              >
                Recommencer
              </button>
            </div>
          )}

          {currentEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-tertiary/80 border border-amber-500/30 rounded-xl p-5 mb-4"
            >
              <p className="text-amber-400 text-xs font-semibold mb-2">ÉVÉNEMENT ALÉATOIRE</p>
              <p className="text-content-secondary leading-relaxed text-sm">{currentEvent.text}</p>
              <div className="flex flex-col gap-2 mt-4">
                {currentEvent.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      applyConsequence(1, JSON.stringify(choice.consequence));
                      setCurrentEvent(null);
                      if (currentBranch?.choix1_lien) {
                        chooseOption(currentBranch.choix1_lien);
                      }
                    }}
                    className="w-full text-left px-4 py-3 bg-surface-tertiary border border-gray-700 hover:border-amber-500/50 rounded-lg text-content-secondary hover:text-content-primary text-sm transition-all"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {!isEnd && currentBranch && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentBranch.choix1 && currentBranch.choix1_lien && (() => {
                const impact = getConsequenceImpact(currentBranch.choix1_consequences);
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { applyConsequence(1, currentBranch?.choix1_consequences); chooseOption(currentBranch.choix1_lien); }}
                    className={`w-full text-left px-5 py-4 bg-surface-tertiary border rounded-xl transition-all duration-200 text-sm leading-relaxed flex items-start gap-3 ${
                      impact.hasImpact 
                        ? impact.isPositive 
                          ? 'hover:border-green-500/60 hover:bg-green-500/10 border-gray-700 hover:text-green-300' 
                          : 'hover:border-red-500/60 hover:bg-red-500/10 border-gray-700 hover:text-red-300'
                        : 'hover:border-cyan-500/60 hover:bg-surface-tertiary border-gray-700 text-content-secondary hover:text-content-primary'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      impact.hasImpact 
                        ? impact.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        : 'bg-gray-700 text-content-secondary'
                    }`}>
                      {impact.hasImpact ? (
                        impact.isPositive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )
                      ) : <span className="text-xs font-bold">1</span>}
                    </div>
                    <div className="flex-1">
                      <span className="block">{currentBranch.choix1}</span>
                      {impact.hasImpact && (
                        <span className={`text-xs mt-1 block ${impact.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {impact.impactText}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })()}
              {currentBranch.choix2 && currentBranch.choix2_lien && (() => {
                const impact = getConsequenceImpact(currentBranch.choix2_consequences);
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { applyConsequence(2, currentBranch?.choix2_consequences); chooseOption(currentBranch.choix2_lien); }}
                    className={`w-full text-left px-5 py-4 bg-surface-tertiary border rounded-xl transition-all duration-200 text-sm leading-relaxed flex items-start gap-3 ${
                      impact.hasImpact 
                        ? impact.isPositive 
                          ? 'hover:border-green-500/60 hover:bg-green-500/10 border-gray-700 hover:text-green-300' 
                          : 'hover:border-red-500/60 hover:bg-red-500/10 border-gray-700 hover:text-red-300'
                        : 'hover:border-cyan-500/60 hover:bg-surface-tertiary border-gray-700 text-content-secondary hover:text-content-primary'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      impact.hasImpact 
                        ? impact.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        : 'bg-gray-700 text-content-secondary'
                    }`}>
                      {impact.hasImpact ? (
                        impact.isPositive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )
                      ) : <span className="text-xs font-bold">2</span>}
                    </div>
                    <div className="flex-1">
                      <span className="block">{currentBranch.choix2}</span>
                      {impact.hasImpact && (
                        <span className={`text-xs mt-1 block ${impact.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {impact.impactText}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })()}

              {/* Compétences de classe */}
              {availableAbilities.length > 0 && character?.classe && !currentEvent && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-purple-400 text-xs font-semibold mb-3">
                    ✨ COMPÉTENCE {character.classe.toUpperCase()}
                  </p>
                  <div className="flex flex-col gap-2">
                    {availableAbilities.map((ability) => (
                      <button
                        key={ability}
                        disabled={usedAbilities.includes(ability)}
                        onClick={() => {
                          setUsedAbilities([...usedAbilities, ability]);
                          // Appliquer l'effet de la compétence (bonus temporaire)
                          const newPv = Math.min(
                            (character.points_vie ?? 100) + 10,
                            (character.points_vie ?? 100)
                          );
                          setCharacter({
                            ...character,
                            points_vie: newPv,
                          });
                          // Avancer dans l'aventure
                          if (currentBranch?.choix1_lien) {
                            chooseOption(currentBranch.choix1_lien);
                          }
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                          usedAbilities.includes(ability)
                            ? "bg-gray-800/50 border border-gray-700 text-content-secondary opacity-50 cursor-not-allowed"
                            : "bg-surface-tertiary border border-purple-500/30 hover:border-purple-500/60 text-content-secondary hover:text-content-primary"
                        }`}
                      >
                        <span className="font-medium">{ability}</span>
                        {!usedAbilities.includes(ability) && (
                          <span className="text-content-secondary ml-2">
                            (1 rest) • +10 PV
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}