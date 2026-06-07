"use client";

import { use, Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import Loader from "@/components/shared/Loader";
import Footer from "@/components/shared/Footer";
import PageBackground from "@/components/shared/PageBackground";
import { useAdventure } from "@/hooks/useAdventure";
import { useSave } from "@/hooks/useSave";
import { useCombat } from "@/hooks/useCombat";
import { useCharacter } from "@/hooks/useCharacter";
import { useConsequences } from "@/hooks/useConsequences";
import { useAuthContext } from "@/context/AuthContext";
import { RANDOM_EVENTS, getRandomEvent } from "@/lib/randomEvents";
import { getAdventureImage } from "@/data/adventureImages";
import { updateQuestProgress } from "@/lib/dailyQuests";
import { checkAndNotifyAchievements } from "@/lib/achievements";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/useToast";

import CharacterHUD from "@/components/adventure/CharacterHUD";
import ChoiceButton from "@/components/adventure/ChoiceButton";
import StorySection from "@/components/adventure/StorySection";
import AdventureHeader from "@/components/adventure/AdventureHeader";

const CombatUI = dynamic(() => import("@/components/adventure/CombatUI"), { ssr: false });
const AdventureEndScreen = dynamic(() => import("@/components/adventure/AdventureEndScreen"), { ssr: false });
const RandomEventCard = dynamic(() => import("@/components/adventure/RandomEventCard"), { ssr: false });
const ConfirmLeaveModal = dynamic(() => import("@/components/shared/ConfirmLeaveModal"), { ssr: false });
const EffectIndicator = dynamic(() => import("@/components/adventure/EffectIndicator"), { ssr: false });

const MAX_STEPS = 8;

const easeOut = [0.16, 1, 0.3, 1] as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

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
  const { user } = useAuthContext();
  const toast = useToast();

  const [currentEvent, setCurrentEvent] = useState<
    (typeof RANDOM_EVENTS)[0] | null
  >(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [initialStats, setInitialStats] = useState<{
    xp: number;
    force: number;
    agility: number;
    magie: number;
    endurance: number;
  } | null>(null);
  const [combatStats, setCombatStats] = useState({ wins: 0, losses: 0 });
  const [fatigueCount, setFatigueCount] = useState(0);

  const {
    character,
    setCharacter,
    loadCharacterProgress,
    saveCharacterStats,
    characterIdNum,
    completeAdventure,
  } = useCharacter({
    personnageId: searchParams.get("personnage"),
    userId: user?.id ?? null,
  });

  const maxFatigue = character ? Math.max(1, (character.stats?.endurance ?? 5) * 2) : 10;
  const isFatigued = fatigueCount >= maxFatigue;
  const damageMultiplier = isFatigued ? 0.7 : 1.0;

  const {
    inCombat,
    combatState,
    startCombat,
    handleCombatAttack,
    handleCombatDefend,
    handleCombatFlee,
    handleCombatAbility,
    handleCombatEnd,
  } = useCombat({
    character,
    setCharacter,
    userId: user?.id ?? null,
    damageMultiplier,
    onCombatEnd: (won) => {
      setCombatStats((prev) => ({
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
      }));
    },
  });

  const { lastConsequence, showEffect, applyConsequence, parseStatChanges } =
    useConsequences({
      character,
      setCharacter,
      startCombat,
      loadCharacterProgress,
      saveCharacterStats,
    });

  const {
    adventure,
    currentBranch,
    loading,
    error,
    isEnd,
    history,
    totalBranches,
    chooseOption,
    restart,
  } = useAdventure(adventureId, user?.id ?? null);

  const totalNodes = totalBranches || MAX_STEPS;
  const progression = Math.min(
    Math.round((history.length / Math.max(totalNodes, 1)) * 100),
    100,
  );

  const { isSaving, save } = useSave({
    userId: user?.id ?? null,
    adventureId: adventureId,
    characterId: characterIdNum,
    branchId: currentBranch?.id ?? null,
    progression,
    enabled: !!user && !!characterIdNum && !isEnd,
    intervalMs: 30_000,
  });

  const lastBranchIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!character || initialStats) return;
    setInitialStats({
      xp: character.experience ?? 0,
      force: character.stats?.force ?? 0,
      agility: character.stats?.agility ?? 0,
      magie: character.stats?.magie ?? 0,
      endurance: character.stats?.endurance ?? 0,
    });
  }, [character, initialStats]);

  useEffect(() => {
    if (!currentBranch || currentEvent || isEnd) return;
    if (lastBranchIdRef.current === currentBranch.id) return;

    lastBranchIdRef.current = currentBranch.id;
    const shouldTrigger = Math.random() < 0.15;
    if (shouldTrigger) {
      const event = getRandomEvent();
      setCurrentEvent(event);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch?.id, currentEvent, isEnd]);

  const completedAdventuresRef = useRef(0);

  useEffect(() => {
    if (isEnd && user && characterIdNum && character) {
      save();
      completeAdventure(history.length, user.id);

      completedAdventuresRef.current += 1;
      const count = completedAdventuresRef.current;
      updateQuestProgress(user.id, "finish_1", 1).then((r) => {
        if (r.completion) {
          toast.success(`Quête terminée : ${r.completion.questId} (+${r.completion.xpAwarded} XP)`);
        }
        window.dispatchEvent(new CustomEvent("profile-refresh"));
        checkAndNotifyAchievements(user.id, (msg) => toast.success(msg));
      }).catch(() => {});
      if (count >= 2) {
        updateQuestProgress(user.id, "finish_2", 1).then((r) => {
          if (r.completion) {
            toast.success(`Quête terminée : ${r.completion.questId} (+${r.completion.xpAwarded} XP)`);
          }
          window.dispatchEvent(new CustomEvent("profile-refresh"));
        }).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEnd,
    user,
    characterIdNum,
    character,
    save,
    history.length,
    completeAdventure,
  ]);

  const startedQuestRef = useRef(false);
  useEffect(() => {
    if (currentBranch && user && !startedQuestRef.current) {
      startedQuestRef.current = true;
      updateQuestProgress(user.id, "play_story", 1).then((r) => {
        if (r.completion) {
          toast.success(`Quête terminée : ${r.completion.questId} (+${r.completion.xpAwarded} XP)`);
        }
        window.dispatchEvent(new CustomEvent("profile-refresh"));
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch?.id, user]);

  const image = getAdventureImage(adventureId);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="min-h-screen bg-deep flex flex-col items-center justify-center gap-4 px-4"
      >
        <p className="text-red-400 text-lg text-center">{error}</p>
        <button
          onClick={() => router.push("/adventure")}
          className="px-6 py-3 bg-gradient-to-r from-primary to-[#3b82f6] text-white rounded-[10px] font-medium transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0px_10px_25px_-3px_rgba(6,182,212,0.5)]"
        >
          Retour aux aventures
        </button>
      </motion.div>
    );
  }

  return (
    <Suspense fallback={<Loader fullScreen />}>
    <div className="min-h-screen bg-deep text-white flex flex-col">
      <PageBackground />
      <AdventureHeader
        onBack={() => {
          if (history.length > 0 && !isEnd) {
            setShowLeaveModal(true);
          } else {
            router.back();
          }
        }}
        onRestart={restart}
        isSaving={isSaving}
      />

      <EffectIndicator
        lastConsequence={lastConsequence}
        showEffect={showEffect}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full px-4 md:px-6 gap-0 md:gap-6 py-4 md:py-6">
        <aside className="md:w-64 md:flex-shrink-0">
          {character && (
            <>
              {/* Desktop: sidebar sticky */}
              <div className="hidden md:block sticky top-24">
                <div className="backdrop-blur-card bg-slate-900/60 border border-cyan-500/15 rounded-card p-4 space-y-4">
                  <CharacterHUD
                    character={character}
                    fatigueCount={fatigueCount}
                    maxFatigue={maxFatigue}
                    isFatigued={isFatigued}
                    sidebar
                  />
                </div>
              </div>

              {/* Mobile: compact collapsible */}
              <div className="md:hidden mb-3">
                <CharacterHUD
                  character={character}
                  fatigueCount={fatigueCount}
                  maxFatigue={maxFatigue}
                  isFatigued={isFatigued}
                />
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="space-y-5"
          >
            {/* Image d'en-tête (discrète) */}
            {image && (
              <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/30 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h1 className="text-white font-bold text-lg md:text-xl drop-shadow-lg">
                    {adventure?.titre ?? "Aventure"}
                  </h1>
                </div>
              </div>
            )}

            {/* Texte de l'histoire */}
            <StorySection
              progression={progression}
              texte={currentBranch?.texte ?? ""}
              branchKey={currentBranch?.id}
            />

            {/* Écran de fin */}
            <AnimatePresence mode="wait">
              {isEnd && character && initialStats && (
                <motion.div
                  key="end-screen"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <AdventureEndScreen
                    historyLength={history.length}
                    characterNiveau={character?.niveau}
                    xpGained={Math.max(0, (character.experience ?? 0) - initialStats.xp)}
                    statsGained={{
                      force: Math.max(0, (character.stats?.force ?? 0) - initialStats.force),
                      agility: Math.max(0, (character.stats?.agility ?? 0) - initialStats.agility),
                      magie: Math.max(0, (character.stats?.magie ?? 0) - initialStats.magie),
                      endurance: Math.max(0, (character.stats?.endurance ?? 0) - initialStats.endurance),
                    }}
                    combatStats={combatStats}
                    onRestart={restart}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Événement aléatoire */}
            <AnimatePresence>
              {currentEvent && (
                <motion.div
                  key="random-event"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                >
                  <RandomEventCard
                    event={currentEvent}
                    onChoice={(consequence, choiceIndex) => {
                      if (currentEvent.type === "combat" && choiceIndex === 0) {
                        import("@/lib/monsters").then(({ getMonsterById }) => {
                          const monsterId = currentEvent.monsterId;
                          if (monsterId) {
                            const monster = getMonsterById(monsterId);
                            if (monster) {
                              startCombat(monster.level);
                            }
                          }
                        });
                        setCurrentEvent(null);
                        return;
                      }

                      applyConsequence(1, JSON.stringify(consequence));
                      setCurrentEvent(null);
                      if (currentBranch?.choix1_lien) {
                        chooseOption(currentBranch.choix1_lien);
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Choix */}
            <AnimatePresence mode="wait">
              {!isEnd && currentBranch && (
                <motion.div
                  key={`choices-${currentBranch.id}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {currentBranch.choix1 && (
                    <ChoiceButton
                      text={currentBranch.choix1}
                      statChanges={parseStatChanges(
                        currentBranch.choix1_consequences,
                      )}
                      onClick={async () => {
                        if (!currentBranch.choix1_lien) {
                          toast.error("Lien manquant pour ce choix");
                          return;
                        }
                        setFatigueCount((prev) => prev + 2);
                        const isCombat = await applyConsequence(
                          1,
                          currentBranch?.choix1_consequences,
                        );
                        if (!isCombat) chooseOption(currentBranch.choix1_lien);
                      }}
                    />
                  )}
                  {currentBranch.choix2 && (
                    <ChoiceButton
                      text={currentBranch.choix2}
                      statChanges={parseStatChanges(
                        currentBranch.choix2_consequences,
                      )}
                      onClick={async () => {
                        if (!currentBranch.choix2_lien) {
                          toast.error("Lien manquant pour ce choix");
                          return;
                        }
                        setFatigueCount((prev) => prev + 2);
                        const isCombat = await applyConsequence(
                          2,
                          currentBranch?.choix2_consequences,
                        );
                        if (!isCombat) chooseOption(currentBranch.choix2_lien);
                      }}
                    />
                  )}

                  {inCombat && combatState && character && (
                    <CombatUI
                      combatState={combatState}
                      character={character}
                      onAttack={handleCombatAttack}
                      onDefend={handleCombatDefend}
                      onFlee={handleCombatFlee}
                      onAbility={handleCombatAbility}
                      onEnd={handleCombatEnd}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

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

      <Footer />
    </div>
    </Suspense>
  );
}
