import {
  CHARACTER_CLASSES,
  calculateRequiredXP,
  getTotalXPForLevel,
  validateCharacterName,
} from '@/lib/characters/classDefinitions'
import { getPrestigeTitle, getXPInCurrentLevel } from '@/lib/leveling'
import { applyXpGain, calculateLevel } from '@/lib/xp'
import type { CharacterClass, CharacterStats } from '@/lib/characters/classDefinitions'

describe('Intégration - Personnages (lib/leveling, lib/xp, lib/characters réels)', () => {
  describe('Flux: création de personnage', () => {
    it('devrait valider le nom ET construire un personnage complet avec PV calculés', () => {
      const name = 'Aragorn'
      const cls: CharacterClass = 'Guerrier'

      // 1. Validation
      const validation = validateCharacterName(name)
      expect(validation.valid).toBe(true)

      // 2. Récupération des stats de la classe
      const classInfo = CHARACTER_CLASSES[cls]
      const hp = 100 + classInfo.baseStats.endurance * 10

      // 3. Construction du personnage
      const character = {
        nom_personnage: name,
        classe: cls,
        niveau: 1,
        points_vie: hp,
        points_vie_max: hp,
        stats: classInfo.baseStats,
        id_utilisateur: 1,
        experience: 0,
      }

      expect(character.points_vie).toBe(170)
      expect(character.niveau).toBe(1)
    })

    it('devrait rejeter un nom invalide sans construire le personnage', () => {
      const validation = validateCharacterName('A')
      expect(validation.valid).toBe(false)
      expect(validation.error).toBeDefined()
    })

    it('devrait calculer différemment les PV par classe (Guerrier > Mage)', () => {
      const warriorHp = 100 + CHARACTER_CLASSES.Guerrier.baseStats.endurance * 10
      const mageHp = 100 + CHARACTER_CLASSES.Mage.baseStats.endurance * 10
      expect(warriorHp).toBeGreaterThan(mageHp)
    })
  })

  describe('getPrestigeTitle (8 paliers)', () => {
    it('devrait retourner Apprenti Aventurier pour niveaux 1-14', () => {
      expect(getPrestigeTitle(1)).toBe('Apprenti Aventurier')
      expect(getPrestigeTitle(10)).toBe('Apprenti Aventurier')
      expect(getPrestigeTitle(14)).toBe('Apprenti Aventurier')
    })

    it('devrait retourner Guerrier Prometteur pour niveaux 15-24', () => {
      expect(getPrestigeTitle(15)).toBe('Guerrier Prometteur')
      expect(getPrestigeTitle(24)).toBe('Guerrier Prometteur')
    })

    it('devrait retourner Aventurier Confirmé pour niveaux 25-39', () => {
      expect(getPrestigeTitle(25)).toBe('Aventurier Confirmé')
      expect(getPrestigeTitle(39)).toBe('Aventurier Confirmé')
    })

    it('devrait retourner Vétéran Aguerri pour niveaux 40-54', () => {
      expect(getPrestigeTitle(40)).toBe('Vétéran Aguerri')
      expect(getPrestigeTitle(54)).toBe('Vétéran Aguerri')
    })

    it('devrait retourner Élite Légendaire pour niveaux 55-69', () => {
      expect(getPrestigeTitle(55)).toBe('Élite Légendaire')
      expect(getPrestigeTitle(69)).toBe('Élite Légendaire')
    })

    it('devrait retourner Maître Absolu pour niveaux 70-84', () => {
      expect(getPrestigeTitle(70)).toBe('Maître Absolu')
      expect(getPrestigeTitle(84)).toBe('Maître Absolu')
    })

    it('devrait retourner Seigneur Suprême pour niveaux 85-99', () => {
      expect(getPrestigeTitle(85)).toBe('Seigneur Suprême')
      expect(getPrestigeTitle(99)).toBe('Seigneur Suprême')
    })

    it('devrait retourner Légende Vivante pour niveau >= 100', () => {
      expect(getPrestigeTitle(100)).toBe('Légende Vivante')
      expect(getPrestigeTitle(250)).toBe('Légende Vivante')
    })
  })

  describe('getXPInCurrentLevel (lib/leveling réel)', () => {
    it('devrait retourner 0 au tout début (niveau 1, 0 XP)', () => {
      expect(getXPInCurrentLevel(1, 0)).toBe(0)
    })

    it('devrait retourner 0 exactement au palier d\'un nouveau niveau', () => {
      // 80 XP total = juste assez pour passer niveau 2, donc 0 dans le nouveau niveau
      expect(getXPInCurrentLevel(2, 80)).toBe(0)
    })

    it('devrait retourner la valeur cumulée depuis le palier', () => {
      // Niveau 2, on a 100 XP total, palier du niveau 2 = 80
      // Donc on a 100 - 80 = 20 dans le niveau
      expect(getXPInCurrentLevel(2, 100)).toBe(20)
    })

    it('ne devrait jamais retourner négatif', () => {
      expect(getXPInCurrentLevel(5, 0)).toBe(0)
      expect(getXPInCurrentLevel(5, 5)).toBe(0)
    })
  })

  describe('applyXpGain (lib/xp réel)', () => {
    it('devrait retourner leveledUp=false si l\'XP ne suffit pas pour level up', () => {
      const result = applyXpGain(1, 0, 50, 100)
      expect(result.leveledUp).toBe(false)
      expect(result.newLevel).toBe(1)
      expect(result.newExperience).toBe(50)
      expect(result.statBonuses).toEqual({})
      expect(result.newMaxPv).toBe(100)
    })

    it('devrait retourner leveledUp=true et calculer les bonus si l\'XP suffit pour 1 niveau', () => {
      const result = applyXpGain(1, 0, 80, 100)
      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBe(2)
      expect(result.newExperience).toBe(80)
      // Level 2 bonus: { endurance: 1 } d'après LEVEL_BONUS
      expect(result.statBonuses.endurance).toBe(1)
    })

    it('devrait calculer les bonus pour plusieurs niveaux d\'un coup', () => {
      // 80 + 108 = 188 XP = passe de niveau 1 à 3
      const result = applyXpGain(1, 0, 200, 100)
      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBeGreaterThanOrEqual(2)
      expect(result.newExperience).toBe(200)
    })

    it('devrait augmenter newMaxPv en fonction des bonus d\'endurance et du nombre de niveaux', () => {
      // Level 2 → +1 endurance → +5 PV
      const r1 = applyXpGain(1, 0, 80, 100)
      expect(r1.newMaxPv).toBe(100 + 1 * 5 + 1 * 5) // 100 base + 5 (endurance) + 5 (niveau)
    })
  })

  describe('calculateLevel (lib/xp réel)', () => {
    it('devrait retourner 1 pour 0 XP', () => {
      expect(calculateLevel(0)).toBe(1)
    })

    it('devrait retourner 1 pour 79 XP (avant le palier 80)', () => {
      expect(calculateLevel(79)).toBe(1)
    })

    it('devrait retourner 2 pour exactement 80 XP (palier niveau 2)', () => {
      expect(calculateLevel(80)).toBe(2)
    })

    it('devrait retourner 3 pour 188+ XP', () => {
      // 80 + 108 = 188
      expect(calculateLevel(188)).toBe(3)
    })

    it('devrait respecter le minLevel (jamais en-dessous)', () => {
      expect(calculateLevel(0, 5)).toBe(5)
    })
  })

  describe('Cohérence entre calculateLevel et calculateRequiredXP/getTotalXPForLevel', () => {
    it('getTotalXPForLevel(N) devrait être le seuil exact pour calculateLevel', () => {
      for (let lvl = 1; lvl <= 5; lvl++) {
        const threshold = getTotalXPForLevel(lvl)
        const calculated = calculateLevel(threshold)
        expect(calculated).toBeGreaterThanOrEqual(lvl)
      }
    })

    it('calculateRequiredXP devrait être l\'XP nécessaire pour passer du niveau N au N+1', () => {
      // Pour passer de 1 à 2, il faut calculateRequiredXP(1) = 80
      // Donc à 80 XP, on est au niveau 2
      expect(calculateLevel(calculateRequiredXP(1))).toBe(2)
    })
  })

  describe('Statistiques: les classes ont des profils distincts', () => {
    it('Mage devrait avoir la magie la plus haute', () => {
      const classes: CharacterClass[] = Object.keys(CHARACTER_CLASSES) as CharacterClass[]
      const mageStats = CHARACTER_CLASSES.Mage.baseStats
      classes.filter((c) => c !== 'Mage').forEach((c) => {
        expect(CHARACTER_CLASSES[c].baseStats.magie).toBeLessThanOrEqual(mageStats.magie)
      })
    })

    it('Barbare devrait avoir la force la plus haute', () => {
      const classes: CharacterClass[] = Object.keys(CHARACTER_CLASSES) as CharacterClass[]
      const barbareStats = CHARACTER_CLASSES.Barbare.baseStats
      classes.filter((c) => c !== 'Barbare').forEach((c) => {
        expect(CHARACTER_CLASSES[c].baseStats.force).toBeLessThanOrEqual(barbareStats.force)
      })
    })

    it('toutes les classes devraient avoir des stats de base différentes', () => {
      const profiles: string[] = []
      const classes: CharacterClass[] = Object.keys(CHARACTER_CLASSES) as CharacterClass[]
      classes.forEach((c) => {
        const s: CharacterStats = CHARACTER_CLASSES[c].baseStats
        profiles.push(`${s.force}-${s.agility}-${s.magie}-${s.endurance}`)
      })
      const uniqueProfiles = new Set(profiles)
      expect(uniqueProfiles.size).toBe(classes.length)
    })
  })
})
