import { calculateRequiredXP } from './characters/classDefinitions'
import { addExperience } from './leveling'
import { LEVEL_BONUS } from './levelBonus'
import { MAX_LEVEL } from './seasons'

export interface LevelUpResult {
  leveledUp: boolean
  newLevel: number
  newExperience: number
  statBonuses: Record<string, number>
  newMaxPv: number
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
  const newLevel = calculateLevel(newExperience, currentLevel)
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
    newMaxPv = basePvMax + (statBonuses.endurance || 0) * 5 + (newLevel - currentLevel) * 5
  }

  return {
    leveledUp,
    newLevel,
    newExperience,
    statBonuses,
    newMaxPv,
  }
}

export function calculateLevel(totalXp: number, minLevel: number = 1): number {
  let level = minLevel;
  let cumulativeXp = 0;
  for (let i = 1; i < level; i++) {
    cumulativeXp += calculateRequiredXP(i);
  }
  while (level < MAX_LEVEL) {
    const xpForNext = calculateRequiredXP(level);
    if (cumulativeXp + xpForNext > totalXp) break;
    cumulativeXp += xpForNext;
    level++;
  }
  return level;
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

  await fetch('/api/progress/character', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterId,
      niveau,
      experience,
      force_personnage: stats.force,
      agility_personnage: stats.agility,
      magie_personnage: stats.magie,
      endurance_personnage: stats.endurance,
      points_vie: pointsVie,
    }),
  });
}

/**
 * Met à jour l'XP du compte utilisateur via le nouveau système (saison + courbe 1-100).
 */
export async function updateUserXp(
  userId: number | undefined,
  source: string,
  xpAmount: number
): Promise<void> {
  if (!userId || xpAmount <= 0) return
  await addExperience(userId, xpAmount, source)
}
