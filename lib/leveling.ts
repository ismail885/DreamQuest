import { supabase } from "@/lib/supabaseClient";
import {
  MAX_LEVEL,
  getCurrentSeason,
} from "@/lib/seasons";
import { calculateRequiredXP } from './characters/classDefinitions';

function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateRequiredXP(i);
  }
  return total;
}

export const TOTAL_XP_FOR_MAX_LEVEL = getTotalXPForLevel(MAX_LEVEL);

export interface AddExperienceResult {
  newLevel: number;
  newExperience: number;
  leveledUp: boolean;
  levelsGained: number;
  seasonId: number;
}

export async function addExperience(
  userId: number,
  amount: number,
  source?: string,
): Promise<AddExperienceResult> {
  const season = getCurrentSeason();
  const multiplier = season.xpMultiplier;
  const adjustedAmount = Math.round(amount * multiplier);

  const { data: user, error } = await supabase
    .from("utilisateur")
    .select("experience, niveau, saison_actuelle, meilleur_niveau")
    .eq("id", userId)
    .single();

  if (error || !user) {
    console.error("[Leveling] Utilisateur introuvable :", userId, error);
    return {
      newLevel: 1, newExperience: 0,
      leveledUp: false, levelsGained: 0, seasonId: season.id,
    };
  }

  const currentLevel = user.niveau ?? 1;
  const currentXP = user.experience ?? 0;
  const newExperience = currentXP + adjustedAmount;

  let newLevel = currentLevel;
  while (newLevel < MAX_LEVEL && newExperience >= getTotalXPForLevel(newLevel + 1)) {
    newLevel++;
  }

  const levelsGained = newLevel - currentLevel;
  const newBestLevel = Math.max(newLevel, user.meilleur_niveau ?? 1);

  const { error: updateError } = await supabase
    .from("utilisateur")
    .update({
      experience: newExperience,
      niveau: newLevel,
      meilleur_niveau: newBestLevel,
      saison_actuelle: season.id,
    })
    .eq("id", userId);

  if (updateError) {
    console.error("[Leveling] Erreur mise à jour XP :", updateError);
  }

  if (levelsGained > 0) {
    console.log(
      `[Leveling] +${adjustedAmount} XP ×${multiplier} (${source ?? "?"}) → Niv.${currentLevel} → ${newLevel} ` +
      `(+${levelsGained}) — Meilleur : ${newBestLevel}`,
    );
  }

  return {
    newLevel,
    newExperience,
    leveledUp: levelsGained > 0,
    levelsGained,
    seasonId: season.id,
  };
}

export async function resetForNewSeason(
  userId: number,
  newSeasonId: number,
): Promise<{ oldLevel: number; bestLevel: number; prestigeTitle: string }> {
  const { data: user } = await supabase
    .from("utilisateur")
    .select("niveau, meilleur_niveau")
    .eq("id", userId)
    .single();

  const oldLevel = user?.niveau ?? 1;
  const bestLevel = Math.max(oldLevel, user?.meilleur_niveau ?? 1);
  const prestigeTitle = getPrestigeTitle(bestLevel);

  await supabase
    .from("utilisateur")
    .update({
      niveau: 1,
      experience: 0,
      saison_actuelle: newSeasonId,
      meilleur_niveau: bestLevel,
    })
    .eq("id", userId);

  return { oldLevel, bestLevel, prestigeTitle };
}

export function getPrestigeTitle(bestLevel: number): string {
  if (bestLevel >= 100) return "Légende Vivante";
  if (bestLevel >= 85) return "Seigneur Suprême";
  if (bestLevel >= 70) return "Maître Absolu";
  if (bestLevel >= 55) return "Élite Légendaire";
  if (bestLevel >= 40) return "Vétéran Aguerri";
  if (bestLevel >= 25) return "Aventurier Confirmé";
  if (bestLevel >= 15) return "Guerrier Prometteur";
  return "Apprenti Aventurier";
}

// Nombre de paliers de prestige franchis (0 = Apprenti, 7 = Legende Vivante).
// Sert de compteur de "trophees" : une distinction par palier de saison atteint.
export function getPrestigeTier(bestLevel: number): number {
  if (bestLevel >= 100) return 7;
  if (bestLevel >= 85) return 6;
  if (bestLevel >= 70) return 5;
  if (bestLevel >= 55) return 4;
  if (bestLevel >= 40) return 3;
  if (bestLevel >= 25) return 2;
  if (bestLevel >= 15) return 1;
  return 0;
}

export function getLevelFromXP(totalExperience: number): number {
  let level = 1;
  while (level < MAX_LEVEL && totalExperience >= getTotalXPForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function getXPInCurrentLevel(level: number, totalExperience: number): number {
  const atLevelStart = level > 1 ? getTotalXPForLevel(level) : 0;
  return Math.max(0, totalExperience - atLevelStart);
}

export function getXPForNextLevel(level: number): number {
  return calculateRequiredXP(level);
}
