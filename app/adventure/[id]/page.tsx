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
import { RANDOM_EVENTS, getRandomEvent } from "@/lib/randomGenerator";
import { motion } from "framer-motion";
import { ConfirmLeaveModal } from "@/components/shared/Breadcrumb";
import CharacterHUD from "@/components/adventure/CharacterHUD";
import EffectIndicator from "@/components/adventure/EffectIndicator";
import ChoiceButton from "@/components/adventure/ChoiceButton";
import StorySection from "@/components/adventure/StorySection";
import RandomEventCard from "@/components/adventure/RandomEventCard";
import ClassAbilitiesPanel from "@/components/adventure/ClassAbilitiesPanel";
import CombatUI from "@/components/adventure/CombatUI";
import AdventureHeader from "@/components/adventure/AdventureHeader";
import AdventureEndScreen from "@/components/adventure/AdventureEndScreen";

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
 const { user } = useAuthContext();

 const [currentEvent, setCurrentEvent] = useState<typeof RANDOM_EVENTS[0] | null>(null);
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

 const {
 lastConsequence,
 showEffect,
 getConsequenceImpact,
 applyConsequence,
 } = useConsequences({
 character,
 setCharacter,
 startCombat,
 loadCharacterProgress,
 saveCharacterStats,
 characterIdNum,
 });

 const { adventure, currentBranch, loading, error, isEnd, history, chooseOption, restart } =
 useAdventure(adventureId, user?.id ?? null);

 const progression = Math.min(Math.round((history.length / MAX_STEPS) * 100), 100);

 const { isSaving, save } = useSave({
 userId: user?.id ?? null,
 adventureId: adventureId,
 characterId: characterIdNum,
 branchId: currentBranch?.id ?? null,
 progression,
 enabled: !!user && !!characterIdNum && !isEnd,
 intervalMs: 30_000,
 });

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
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [currentBranch?.id, currentEvent, isEnd]);

 useEffect(() => {
 if (isEnd && user && characterIdNum && character) {
 save();
 completeAdventure(history.length, user.id);
 }
 }, [isEnd, user, characterIdNum, character, save, history.length, completeAdventure]);

 const image = ADVENTURE_IMAGES[adventureId] ?? ADVENTURE_IMAGES[1];

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
 className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
 >
 Retour aux aventures
 </button>
 </div>
 );
 }

  return (
    <div className="min-h-screen bg-[#070b15] text-white flex flex-col">
      {/* Header */}
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

      {/* Effect popup */}
      <EffectIndicator lastConsequence={lastConsequence} showEffect={showEffect} />

      {/* Character stats */}
      {character && <CharacterHUD character={character} />}

      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-3xl space-y-5">
          {/* Story section */}
          <StorySection
            progression={progression}
            image={image}
            adventureTitle={adventure?.titre ?? "Aventure"}
            texte={currentBranch?.texte ?? ""}
          />

          {/* End screen */}
          {isEnd && (
            <AdventureEndScreen
              historyLength={history.length}
              characterNiveau={character?.niveau}
              onRestart={restart}
            />
          )}

          {/* Random event */}
          {currentEvent && (
            <RandomEventCard
              event={currentEvent}
              onChoice={(consequence) => {
                applyConsequence(1, JSON.stringify(consequence));
                setCurrentEvent(null);
                if (currentBranch?.choix1_lien) {
                  chooseOption(currentBranch.choix1_lien);
                }
              }}
            />
          )}

          {/* Choices + Class Abilities */}
          {!isEnd && currentBranch && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentBranch.choix1 && currentBranch.choix1_lien && (
                <ChoiceButton
                  label="1"
                  text={currentBranch.choix1}
                  impact={getConsequenceImpact(currentBranch.choix1_consequences)}
                  onClick={async () => {
                    const isCombat = await applyConsequence(1, currentBranch?.choix1_consequences);
                    if (!isCombat) chooseOption(currentBranch.choix1_lien);
                  }}
                />
              )}
              {currentBranch.choix2 && currentBranch.choix2_lien && (
                <ChoiceButton
                  label="2"
                  text={currentBranch.choix2}
                  impact={getConsequenceImpact(currentBranch.choix2_consequences)}
                  onClick={async () => {
                    const isCombat = await applyConsequence(2, currentBranch?.choix2_consequences);
                    if (!isCombat) chooseOption(currentBranch.choix2_lien);
                  }}
                />
              )}

              {/* Class abilities */}
              {character && !currentEvent && (
                <ClassAbilitiesPanel
                  character={character}
                  availableAbilities={availableAbilities}
                  usedAbilities={usedAbilities}
                  onUseAbility={(ability) => {
                    setUsedAbilities([...usedAbilities, ability]);
                    const newPv = Math.min(
                      (character.points_vie ?? 100) + 10,
                      (character.points_vie ?? 100),
                    );
                    setCharacter({ ...character, points_vie: newPv });
                    if (currentBranch?.choix1_lien) {
                      chooseOption(currentBranch.choix1_lien);
                    }
                  }}
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

      {/* Combat overlay */}
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
    </div>
  );
}
