"use client";

import { use, Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/shared/Loader";
import { useAdventure } from "@/hooks/useAdventure";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import type { Character, ConsequenceEffect } from "@/types";
import { CHARACTER_CLASSES } from "@/types/character";
import { LEVEL_BONUS, RANDOM_EVENTS, ABILITIES_POOL, getRandomEvent } from "@/lib/randomGenerator";
import { playerAttack, enemyAttack, initCombat, useAbility as executeAbility, getAbilitiesForClass, applyPoisonDamage, updateCombatStatus, updateEnemyStatus, type CombatState, type CombatAbility } from "@/lib/combat";
import { motion } from "framer-motion";
import type { CharacterClass } from "@/types";
import Breadcrumb, { ConfirmLeaveModal } from "@/components/shared/Breadcrumb";

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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  // Combat state
  const [inCombat, setInCombat] = useState(false);
  const [combatState, setCombatState] = useState<CombatState | null>(null);

  // Parse consequence JSON to show impact indicator
  const getConsequenceImpact = (consequencesJson: string | null | undefined): { hasImpact: boolean; isPositive: boolean; impactText: string; isCombat: boolean } => {
    if (!consequencesJson) return { hasImpact: false, isPositive: true, impactText: "", isCombat: false };
    
    try {
      const effect = JSON.parse(consequencesJson);
      
      // Détecter le type combat
      if (effect.type === "combat") {
        return { hasImpact: true, isPositive: false, impactText: "⚔️ Combat!", isCombat: true };
      }
      
      if (!effect || (effect.pv === 0 && !effect.force && !effect.agility && !effect.magie && !effect.endurance)) {
        return { hasImpact: false, isPositive: true, impactText: "", isCombat: false };
      }
      
      const impacts: string[] = [];
      let isPositive = true;
      
      if (effect.pv) { impacts.push(`${effect.pv > 0 ? '+' : ''}${effect.pv} PV`); if (effect.pv < 0) isPositive = false; }
      if (effect.force) { impacts.push(`${effect.force > 0 ? '+' : ''}${effect.force} Force`); if (effect.force < 0) isPositive = false; }
      if (effect.agility) { impacts.push(`${effect.agility > 0 ? '+' : ''}${effect.agility} Agilité`); if (effect.agility < 0) isPositive = false; }
      if (effect.magie) { impacts.push(`${effect.magie > 0 ? '+' : ''}${effect.magie} Intelligence`); if (effect.magie < 0) isPositive = false; }
      if (effect.endurance) { impacts.push(`${effect.endurance > 0 ? '+' : ''}${effect.endurance} Endurance`); if (effect.endurance < 0) isPositive = false; }
      
      return { hasImpact: impacts.length > 0, isPositive, impactText: impacts.join(" • "), isCombat: false };
    } catch {
      return { hasImpact: false, isPositive: true, impactText: "", isCombat: false };
    }
  };

  const applyConsequence = async (choixNum: 1 | 2, consequencesJson: string | null | undefined): Promise<boolean> => {
    if (!character || !consequencesJson) return false;
    
    let effect: { type?: string; level?: number; pv?: number; force?: number; agility?: number; magie?: number; endurance?: number; text?: string } | null = null;
    const statChanges: Record<string, number> = {};
    
    // Essayer le format JSON d'abord
    try {
      effect = JSON.parse(consequencesJson);
    } catch {
      // Format texte "Stats: force:2,agility:-1"
      if (consequencesJson.includes("Stats:")) {
        const statsMatch = consequencesJson.match(/Stats:\s*([\w:,\s+-]+)/);
        if (statsMatch) {
          const statPairs = statsMatch[1].split(',');
          for (const pair of statPairs) {
            const [stat, value] = pair.split(':').map(s => s.trim());
            if (stat && value) {
              const numValue = parseInt(value);
              if (!isNaN(numValue)) {
                statChanges[stat] = numValue;
              }
            }
          }
        }
      }
    }
    
    if (!effect && Object.keys(statChanges).length === 0) return false;
    
    try {
      // Gérer le combat
      if (effect?.type === "combat") {
        const enemyLevel = effect.level || character.niveau || 1;
        const manaMax = 50 + (character.niveau || 1) * 5; // Mana basé sur le niveau
        const newCombat = initCombat(character.points_vie_max || 100, manaMax, enemyLevel);
        setCombatState(newCombat);
        setInCombat(true);
        return true; // Indique que le combat doit remplacer la navigation
      }

      // Appliquer les changements de stats (depuis JSON ou format texte)
      const statDelta = effect ? {
        force: effect.force ?? 0,
        agility: effect.agility ?? 0,
        magie: effect.magie ?? 0,
        endurance: effect.endurance ?? 0,
      } : statChanges;

      const newStats = {
        force: (character.stats?.force ?? 0) + (statDelta.force ?? 0),
        agility: (character.stats?.agility ?? 0) + (statDelta.agility ?? 0),
        magie: (character.stats?.magie ?? 0) + (statDelta.magie ?? 0),
        endurance: (character.stats?.endurance ?? 0) + (statDelta.endurance ?? 0),
      };
      const newPv = Math.max(0, (character.points_vie ?? 0) + (effect?.pv ?? 0));

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

      // Sauvegarder les stats dans localStorage
      const progress = loadCharacterProgress();
      const currentExp = progress?.experience ?? character.experience ?? 0;
      const currentLevel = progress?.niveau ?? character.niveau ?? 1;
      saveCharacterProgress(currentLevel, newStats, currentExp);

      setLastConsequence({
        pv_change: effect?.pv ?? 0,
        force_change: statDelta.force,
        agility_change: statDelta.agility,
        magie_change: statDelta.magie,
        endurance_change: statDelta.endurance,
        text: effect?.text,
      });
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 3000);
      return false;
    } catch {
      return false;
    }
};

  // Combat handlers
  const handleCombatAttack = () => {
    if (!combatState || !character || !combatState.enemy) return;
    
    const playerStats = {
      force: character.stats?.force || 0,
      agility: character.stats?.agility || 0,
      magie: character.stats?.magie || 0,
      endurance: character.stats?.endurance || 0,
    };
    
    const result = playerAttack(playerStats, combatState.enemy, combatState.status);
    const newEnemyPv = Math.max(0, combatState.enemy.pv - result.dmg);
    const newLog = [...combatState.log, result.log];
    
    if (newEnemyPv <= 0) {
      // Victoire - gain d'XP et potentiellement de level
      const xpGain = combatState.enemy.xpReward || 0;
      const newPv = character.points_vie || 0;
      
      setCharacter(prev => prev ? { ...prev, points_vie: newPv, experience: (prev.experience || 0) + xpGain } : null);
      setCombatState({ ...combatState, enemy: { ...combatState.enemy!, pv: 0 }, log: newLog, won: true });
    } else {
      setCombatState({
        ...combatState,
        enemy: { ...combatState.enemy!, pv: newEnemyPv },
        log: newLog,
        turn: "enemy",
      });
    }
  };

  const handleCombatDefend = () => {
    if (!combatState || !character) return;
    
    const playerStats = {
      force: character.stats?.force || 0,
      agility: character.stats?.agility || 0,
      magie: character.stats?.magie || 0,
      endurance: character.stats?.endurance || 0,
    };
    
    const reduction = Math.floor((playerStats.agility + (character.stats?.endurance || 0)) / 4);
    const hasThorns = combatState.status.buff_defense > 0;
    const result = enemyAttack(combatState.enemy!, combatState.status, hasThorns);
    const dmg = Math.max(1, result.dmg - reduction);
    const newPlayerPv = Math.max(0, combatState.playerPv - dmg);
    const newLog = [...combatState.log, result.log, `Tu pare! -${reduction} dégats.`];
    
    setCharacter(prev => prev ? { ...prev, points_vie: newPlayerPv } : null);
    setCombatState({
      ...combatState,
      playerPv: newPlayerPv,
      log: newLog,
      turn: "player",
    });
  };

  const handleCombatFlee = () => {
    if (!combatState || !character) return;
    
    const playerStats = {
      force: character.stats?.force || 0,
      agility: character.stats?.agility || 0,
      magie: character.stats?.magie || 0,
      endurance: character.stats?.endurance || 0,
    };
    
    const success = Math.random() < (playerStats.agility / 100 + 0.3);
    if (success) {
      setCombatState({ ...combatState, fled: true, log: [...combatState.log, "Tu fuis le combat!"] });
    } else {
      const hasThorns = combatState.status.buff_defense > 0;
      const result = enemyAttack(combatState.enemy!, combatState.status, hasThorns);
      const newPlayerPv = Math.max(0, combatState.playerPv - result.dmg);
      setCharacter(prev => prev ? { ...prev, points_vie: newPlayerPv } : null);
      setCombatState({
        ...combatState,
        playerPv: newPlayerPv,
        log: [...combatState.log, result.log, "Fuite échouée!"],
        turn: "player",
      });
    }
  };

  const handleCombatAbility = (ability: CombatAbility) => {
    if (!combatState || !character || !combatState.enemy) return;
    if (combatState.turn !== "player") return;
    if (combatState.playerMana < ability.manaCost) {
      setCombatState(prev => prev ? { 
        ...prev, 
        log: [...prev.log, "Pas assez de mana!"] 
      } : null);
      return;
    }

    const playerStats = {
      force: character.stats?.force || 0,
      agility: character.stats?.agility || 0,
      magie: character.stats?.magie || 0,
      endurance: character.stats?.endurance || 0,
    };

    const result = executeAbility(
      ability.id,
      character.classe || "guerrier",
      playerStats,
      combatState.enemy,
      combatState.status,
      combatState.playerPv,
      combatState.playerMana
    );

    if (!result.success) {
      setCombatState(prev => prev ? { 
        ...prev, 
        log: [...prev.log, result.log] 
      } : null);
      return;
    }

    // Appliquer les résultats
    let newEnemyPv = combatState.enemy.pv;
    const newPlayerPv = Math.min(combatState.playerPvMax, combatState.playerPv + (result.heal || 0));
    const newLog = [...combatState.log, result.log];
    const newStatus = result.newStatus || combatState.status;
    let newEnemyStatus = combatState.enemyStatus;

    // Appliquer les dégats à l'ennemi
    if (result.damage) {
      newEnemyPv = Math.max(0, combatState.enemy.pv - result.damage);
      newEnemyStatus = [...newEnemyStatus, ...(result.newEnemyStatus || [])];
    }

    // Vérifier si l'ennemi est vaincu
    if (newEnemyPv <= 0) {
      const xpGain = combatState.enemy.xpReward || 0;
      setCharacter(prev => prev ? { 
        ...prev, 
        points_vie: newPlayerPv, 
        experience: (prev.experience || 0) + xpGain 
      } : null);
      setCombatState({
        ...combatState,
        enemy: { ...combatState.enemy!, pv: 0 },
        playerPv: newPlayerPv,
        playerMana: combatState.playerMana - result.manaUsed,
        log: newLog,
        won: true,
        status: newStatus,
        enemyStatus: newEnemyStatus,
      });
      return;
    }

    // Passer au tour de l'ennemi
    setCombatState({
      ...combatState,
      enemy: { ...combatState.enemy!, pv: newEnemyPv },
      playerPv: newPlayerPv,
      playerMana: combatState.playerMana - result.manaUsed,
      log: newLog,
      turn: "enemy",
      status: newStatus,
      enemyStatus: newEnemyStatus,
    });
  };

  const handleCombatEnd = async () => {
    if (!character) return;
    
    // Sauvegarder les PV après combat
    if (character.id) {
      await supabase.from('personnage').update({
        points_vie: character.points_vie,
      }).eq('id', character.id);
    }
    
    setInCombat(false);
    setCombatState(null);
  };

  // Gestion du tour de l'ennemi
  useEffect(() => {
    if (!combatState || !character || !combatState.enemy) return;
    if (combatState.turn !== "enemy" || combatState.won || combatState.fled) return;
    
    const timer = setTimeout(() => {
      // Vérifier si l'ennemi est étourdi
      if (combatState.enemyStatus.includes("stunned")) {
        const newStatus = updateEnemyStatus(combatState.enemyStatus);
        setCombatState(prev => prev ? {
          ...prev,
          log: [...prev.log, `${prev.enemy?.name} est étourdi et passe son tour!`],
          turn: "player",
          enemyStatus: newStatus,
          playerMana: Math.min(prev.playerManaMax, prev.playerMana + 10),
          status: updateCombatStatus(prev.status),
        } : null);
        return;
      }

      // Appliquer les dégats du poison
      if (!combatState.enemy) return;
      let currentEnemyPv = combatState.enemy.pv;
      let currentPlayerPv = combatState.playerPv;
      const logMessages: string[] = [];
      
      if (combatState.enemyStatus.includes("poison")) {
        const poisonResult = applyPoisonDamage(combatState.enemy);
        currentEnemyPv = Math.max(0, currentEnemyPv - poisonResult.dmg);
        logMessages.push(poisonResult.log);
      }

      // Attaque de l'ennemi
      const hasThorns = combatState.status.buff_defense > 0;
      const result = enemyAttack(combatState.enemy, combatState.status, hasThorns);
      const finalDmg = Math.max(1, result.dmg - (combatState.status.buff_defense > 0 ? Math.floor(result.dmg * 0.3) : 0));
      currentPlayerPv = Math.max(0, currentPlayerPv - finalDmg);
      logMessages.push(result.log);

      // Mettre à jour les PV du personnage dans le state global
      if (currentPlayerPv !== combatState.playerPv) {
        setCharacter(prev => prev ? { ...prev, points_vie: currentPlayerPv } : null);
      }

      // Vérifier si le joueur est mort
      if (currentPlayerPv <= 0) {
        setCombatState(prev => prev ? {
          ...prev,
          playerPv: 0,
          log: [...prev.log, ...logMessages, "Tu as été vaincu!"],
          won: false,
        } : null);
        return;
      }

      // Passer au tour du joueur avec régénération de mana et mise à jour des statuts
      setCombatState(prev => prev ? {
        ...prev,
        enemy: { ...prev.enemy!, pv: currentEnemyPv },
        playerPv: currentPlayerPv,
        log: [...prev.log, ...logMessages],
        turn: "player",
        playerMana: Math.min(prev.playerManaMax, prev.playerMana + 10),
        status: updateCombatStatus(prev.status),
        enemyStatus: updateEnemyStatus(prev.enemyStatus),
      } : null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [combatState?.turn]);

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
        if (data) {
          // Récupérer les stats par défaut de la classe si elles ne sont pas en BDD
          const classe = data.classe as CharacterClass;
          const defaultStats = CHARACTER_CLASSES[classe]?.baseStats || { force: 5, agility: 5, magie: 5, endurance: 5 };
          
          const characterWithStats: Character = {
            ...data,
            stats: data.stats || defaultStats,
            points_vie_max: data.points_vie_max || 100,
            experience: data.experience || 0,
          };
          setCharacter(characterWithStats);
        }
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
  const lastBranchIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!currentBranch || currentEvent || isEnd) return;
    if (lastBranchIdRef.current === currentBranch.id) return;
    
    lastBranchIdRef.current = currentBranch.id;
    const shouldTrigger = Math.random() < 0.15;
    if (shouldTrigger) {
      const event = getRandomEvent();
      setCurrentEvent(event);
    }
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

  const saveCharacterProgress = useCallback((niveau: number, stats: { force: number; agility: number; magie: number; endurance: number }, experience: number) => {
    if (!user || !characterIdNum) return;
    const key = `dq_char_${user.id}_${characterIdNum}`;
    localStorage.setItem(key, JSON.stringify({ niveau, stats, experience, updatedAt: new Date().toISOString() }));
  }, [user, characterIdNum]);

  useEffect(() => {
    if (isEnd && user && characterIdNum && character) {
      save();
      const progress = loadCharacterProgress() || { niveau: character.niveau ?? 1, stats: { force: 5, agility: 5, magie: 5, endurance: 5 }, experience: 0 };
      const xpGained = history.length * 50;
      const newExperience = progress.experience + xpGained;
      const newLevel = Math.min(Math.floor(newExperience / 500) + 1, 10);
      const bonus = LEVEL_BONUS[newLevel] || {};
      const newStats = {
        force: (progress.stats?.force ?? 5) + (bonus.force ?? 0),
        agility: (progress.stats?.agility ?? 5) + (bonus.agility ?? 0),
        magie: (progress.stats?.magie ?? 5) + (bonus.magie ?? 0),
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
          onClick={() => {
            if (history.length > 0 && !isEnd) {
              setShowLeaveModal(true);
            } else {
              router.back();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-surface-tertiary border border-gray-700 hover:border-gray-500 rounded-lg text-content-secondary hover:text-content-primary transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <div className="flex items-center gap-2">
          <Breadcrumb 
            items={[
              { label: 'Aventures', href: '/adventure' },
              { label: adventure?.titre ?? 'Aventure' },
            ]}
            currentStep={history.length + 1}
            totalSteps={MAX_STEPS}
          />
        </div>

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
              {lastConsequence.magie_change !== undefined && lastConsequence.magie_change !== 0 && (
                <span className={lastConsequence.magie_change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {lastConsequence.magie_change > 0 ? '+' : ''}{lastConsequence.magie_change} Magie
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
              <p className="text-content-primary font-bold text-lg leading-none">{character.stats?.magie ?? 0}</p>
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    onClick={async () => { const isCombat = await applyConsequence(1, currentBranch?.choix1_consequences); if (!isCombat) chooseOption(currentBranch.choix1_lien); }}
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
                    onClick={async () => { const isCombat = await applyConsequence(2, currentBranch?.choix2_consequences); if (!isCombat) chooseOption(currentBranch.choix2_lien); }}
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

      <ConfirmLeaveModal
        isOpen={showLeaveModal}
        onConfirm={() => {
          setShowLeaveModal(false);
          save();
          router.back();
        }}
        onCancel={() => setShowLeaveModal(false)}
        title="Quitter l'aventure ?"
        message="Votre progression a été sauvegardée automatiquement."
      />

      {/* Combat UI Overlay */}
      {inCombat && combatState && character && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#0d1526] border border-red-500/50 rounded-xl max-w-lg w-full overflow-hidden">
            <div className="bg-red-900/30 border-b border-red-500/30 p-3 text-center">
              <h2 className="text-red-400 font-bold text-lg">COMBAT</h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-white font-bold">Toi</div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden w-32">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                      style={{ width: `${(combatState.playerPv / combatState.playerPvMax) * 100}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm">{combatState.playerPv} / {combatState.playerPvMax} PV</div>
                  {/* Mana bar */}
                  <div className="mt-2">
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden w-32">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                        style={{ width: `${(combatState.playerMana / combatState.playerManaMax) * 100}%` }}
                      />
                    </div>
                    <div className="text-blue-400 text-sm">{combatState.playerMana} / {combatState.playerManaMax} Mana</div>
                  </div>
                </div>
                <div className="text-3xl">VS</div>
                <div className="flex-1 text-right">
                  <div className="text-red-400 font-bold">{combatState.enemy?.name}</div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden w-32 ml-auto">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all"
                      style={{ width: `${((combatState.enemy?.pv || 0) / (combatState.enemy?.pvMax || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm">{combatState.enemy?.pv} / {combatState.enemy?.pvMax} PV</div>
                </div>
              </div>

              {/* Status effects display */}
              {(combatState.status.buff_force > 0 || combatState.status.buff_agility > 0 || combatState.status.buff_defense > 0) && (
                <div className="flex gap-2 text-xs">
                  {combatState.status.buff_force > 0 && (
                    <span className="text-orange-400">Force +{combatState.status.buff_force}</span>
                  )}
                  {combatState.status.buff_agility > 0 && (
                    <span className="text-green-400">Agilité +{combatState.status.buff_agility}</span>
                  )}
                  {combatState.status.buff_defense > 0 && (
                    <span className="text-blue-400">Bouclier {combatState.status.buff_defense}tours</span>
                  )}
                </div>
              )}

              <p className="text-gray-300 text-sm">{combatState.enemy?.description}</p>

              {combatState.enemy && !combatState.won && !combatState.fled && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleCombatAttack}
                    disabled={combatState.turn !== "player"}
                    className="py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-bold"
                  >
                    Attaquer
                  </button>
                  <button
                    onClick={handleCombatDefend}
                    disabled={combatState.turn !== "player"}
                    className="py-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    Défense
                  </button>
                  <button
                    onClick={handleCombatFlee}
                    disabled={combatState.turn !== "player"}
                    className="py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50"
                  >
                    Fuir
                  </button>
                </div>
              )}

              {/* Compétences */}
              {combatState.enemy && !combatState.won && !combatState.fled && (
                <div className="mt-4">
                  <div className="text-purple-400 text-sm font-semibold mb-2">Compétences</div>
                  <div className="grid grid-cols-1 gap-2">
                    {getAbilitiesForClass(character?.classe || "guerrier").map((ability) => (
                      <button
                        key={ability.id}
                        onClick={() => handleCombatAbility(ability)}
                        disabled={combatState.turn !== "player" || combatState.playerMana < ability.manaCost}
                        className={`py-2 px-3 rounded-lg text-left transition-all ${
                          combatState.playerMana < ability.manaCost
                            ? "bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed"
                            : ability.type === "attack"
                            ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                            : ability.type === "defense"
                            ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                            : "bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                        } disabled:opacity-50`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{ability.name}</span>
                          <span className="text-xs">{ability.manaCost} Mana</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{ability.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#0a0e1a] rounded-lg p-3 h-32 overflow-y-auto">
                <div className="space-y-1">
                  {combatState.log.slice(-5).map((line, i) => (
                    <p key={i} className="text-gray-300 text-sm">{line}</p>
                  ))}
                </div>
              </div>

              {(combatState.won || combatState.fled) && (
                <button
                  onClick={handleCombatEnd}
                  className="w-full py-3 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600"
                >
                  {combatState.won ? `Victoire! +${combatState.enemy?.xpReward || 0} XP` : "Combat terminé"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}