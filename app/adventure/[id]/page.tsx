"use client";

import { use, Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Loader from "@/components/shared/Loader";
import { useAdventure } from "@/hooks/useAdventure";
import { useSave } from "@/hooks/useSave";
import { useCombat } from "@/hooks/useCombat";
import { useCharacter } from "@/hooks/useCharacter";
import { useConsequences } from "@/hooks/useConsequences";
import { useAuthContext } from "@/context/AuthContext";
import { RANDOM_EVENTS, getRandomEvent } from "@/lib/randomEvents";
import { getAdventureImage } from "@/data/adventureImages";
import { updateQuestProgress } from "@/lib/dailyQuests";
import { motion } from "framer-motion";
import ConfirmLeaveModal from "@/components/shared/ConfirmLeaveModal";
import CharacterHUD from "@/components/adventure/CharacterHUD";
import EffectIndicator from "@/components/adventure/EffectIndicator";
import ChoiceButton from "@/components/adventure/ChoiceButton";
import StorySection from "@/components/adventure/StorySection";
import RandomEventCard from "@/components/adventure/RandomEventCard";
import CombatUI from "@/components/adventure/CombatUI";
import AdventureHeader from "@/components/adventure/AdventureHeader";
import AdventureEndScreen from "@/components/adventure/AdventureEndScreen";

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
  const { user } = useAuthContext();

  const [currentEvent, setCurrentEvent] = useState<
    (typeof RANDOM_EVENTS)[0] | null
  >(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const {
    character,
    setCharacter,
    availableAbilities,
    usedAbilities,
    setUsedAbilities,
    loadCharacterProgress,
    saveCharacterStats,
    characterIdNum,
    completeAdventure,
  } = useCharacter({
    personnageId: searchParams.get("personnage"),
    userId: user?.id ?? null,
  });

  const {
    inCombat,
    combatState,
    startCombat,
    handleCombatAttack,
    handleCombatDefend,
    handleCombatFlee,
    handleCombatAbility,
    handleCombatEnd,
  } = useCombat({ character, setCharacter, userId: user?.id ?? null });

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
    chooseOption,
    restart,
  } = useAdventure(adventureId, user?.id ?? null);

  const progression = Math.min(
    Math.round((history.length / MAX_STEPS) * 100),
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
      updateQuestProgress(user.id, "finish_1", 1).catch(() => {});
      if (count >= 2) {
        updateQuestProgress(user.id, "finish_2", 1).catch(() => {});
      }
    }
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
      updateQuestProgress(user.id, "play_story", 1).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch?.id, user]);

  const image = getAdventureImage(adventureId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b15] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b15] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={() => router.push("/adventure")}
          className="px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white rounded-[10px] font-medium hover:opacity-90 transition-opacity"
        >
          Retour aux aventures
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b15] text-white flex flex-col">
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

      {character && <CharacterHUD character={character} />}

      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-3xl space-y-5">
          <StorySection
            progression={progression}
            image={image}
            adventureTitle={adventure?.titre ?? "Aventure"}
            texte={currentBranch?.texte ?? ""}
          />

          {isEnd && (
            <AdventureEndScreen
              historyLength={history.length}
              characterNiveau={character?.niveau}
              onRestart={restart}
            />
          )}

          {currentEvent && (
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
          )}

          {!isEnd && currentBranch && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentBranch.choix1 && (
                <ChoiceButton
                  text={currentBranch.choix1}
                  statChanges={parseStatChanges(
                    currentBranch.choix1_consequences,
                  )}
                  onClick={async () => {
                    if (!currentBranch.choix1_lien) {
                      console.error("Choix 1 lien manquant");
                      return;
                    }
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
                      console.error("Choix 2 lien manquant");
                      return;
                    }
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
    </div>
  );
}
