import { supabase } from './supabaseClient'
import { calculateRequiredXP } from './characters/classDefinitions'
import { LEVEL_BONUS } from './levelBonus'

export interface LevelUpResult {
  leveledUp: boolean
  newLevel: number
  newExperience: number
  statBonuses: Record<string, number>
  newMaxPv: number
}

/**
 * Calcule le niveau à partir de l'XP totale cumulée.
 * Utilise la formule exponentielle: 100 * 1.5^(level-1) par niveau.
 */
export const MAX_LEVEL = 100;

export function calculateLevel(totalXp: number): number {
  let level = 1
  let cumulativeXp = 0
  while (level < MAX_LEVEL) {
    const xpForNext = calculateRequiredXP(level)
    if (cumulativeXp + xpForNext > totalXp) break
    cumulativeXp += xpForNext
    level++
  }
  return level
}

/**
 * Applique le gain d'XP à un personnage et gère la montée de niveau.
 */
export function applyXpGain(
  currentLevel: number,
  currentXp: number,
  xpGained: number,
  basePvMax: number
): LevelUpResult {
  const newExperience = currentXp + xpGained
  const newLevel = calculateLevel(newExperience)
  const leveledUp = newLevel > currentLevel

  const statBonuses: Record<string, number> = {}
  let newMaxPv = basePvMax

  if (leveledUp) {
    for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
      const bonus = LEVEL_BONUS[lvl]
      if (bonus) {
        if (bonus.force) statBonuses.force = (statBonuses.force || 0) + bonus.force
        if (bonus.agility) statBonuses.agility = (statBonuses.agility || 0) + bonus.agility
        if (bonus.magie) statBonuses.magie = (statBonuses.magie || 0) + bonus.magie
        if (bonus.endurance) statBonuses.endurance = (statBonuses.endurance || 0) + bonus.endurance
      }
    }
    newMaxPv = basePvMax + (statBonuses.endurance || 0) * 10 + (newLevel - currentLevel) * 10
  }

  return {
    leveledUp,
    newLevel,
    newExperience,
    statBonuses,
    newMaxPv,
  }
}

/**
 * Sauvegarde la progression d'un personnage.
 */
export async function saveCharacterProgress(
  characterId: number,
  niveau: number,
  experience: number,
  stats: { force: number; agility: number; magie: number; endurance: number },
  pointsVie: number
): Promise<void> {
  if (!characterId) return

  await supabase
    .from('personnage')
    .update({
      niveau,
      experience,
      force_personnage: stats.force,
      agility_personnage: stats.agility,
      magie_personnage: stats.magie,
      endurance_personnage: stats.endurance,
      points_vie: pointsVie,
    })
    .eq('id', characterId)
}

/**
 * Met à jour l'XP du user avec l'XP gagnée par le personnage.
 */
export async function updateUserXp(
  userId: number | undefined,
  characterXp: number
): Promise<void> {
  if (!userId || characterXp <= 0) return

  const { data: userData } = await supabase
    .from('utilisateur')
    .select('experience, niveau')
    .eq('id', userId)
    .maybeSingle()

  const currentXp = userData?.experience ?? 0
  const currentLevel = userData?.niveau ?? 1
  const newXp = currentXp + characterXp
  const newLevel = Math.max(currentLevel, calculateLevel(newXp))

  await supabase
    .from('utilisateur')
    .update({
      experience: newXp,
      niveau: newLevel,
    })
    .eq('id', userId)
}
