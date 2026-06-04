import {
  CHARACTER_CLASSES,
  ABILITIES_DATA,
  CLASS_DIFFICULTIES,
  CLASS_PASSIVES,
  DIFFICULTY_LABELS,
  STAT_LABELS,
  STAT_ICONS,
  STAT_COLORS,
  CLASS_ICONS,
  calculateRequiredXP,
  getTotalXPForLevel,
  getClassAbilitiesWithInfo,
  getFormattedStats,
  validateCharacterName,
} from '@/lib/characters/classDefinitions'
import { getPrestigeTitle, getXPInCurrentLevel, getXPForNextLevel } from '@/lib/leveling'
import type { ClassInfo, CharacterStats, CharacterClass } from '@/lib/characters/classDefinitions'

describe('Unitaires - Personnages (lib réel)', () => {
  describe('CHARACTER_CLASSES', () => {
    it('devrait exposer 10 classes', () => {
      const classes = Object.keys(CHARACTER_CLASSES)
      expect(classes).toHaveLength(10)
    })

    it('devrait contenir les classes principales', () => {
      const required: CharacterClass[] = [
        'Guerrier', 'Mage', 'Archer', 'Assassin', 'Paladin',
        'Prêtre', 'Druide', 'Nécromancien', 'Voleur', 'Barbare',
      ]
      required.forEach((cls) => {
        expect(CHARACTER_CLASSES).toHaveProperty(cls)
      })
    })

    it('devrait avoir une description non vide pour chaque classe', () => {
      Object.values(CHARACTER_CLASSES).forEach((cls: ClassInfo) => {
        expect(cls.description).toBeDefined()
        expect(cls.description.length).toBeGreaterThan(0)
      })
    })

    it('devrait avoir des stats de base positives pour chaque classe', () => {
      Object.values(CHARACTER_CLASSES).forEach((cls: ClassInfo) => {
        expect(cls.baseStats.force).toBeGreaterThan(0)
        expect(cls.baseStats.agility).toBeGreaterThan(0)
        expect(cls.baseStats.magie).toBeGreaterThan(0)
        expect(cls.baseStats.endurance).toBeGreaterThan(0)
        expect(cls.role).toBeDefined()
        expect(cls.playstyle).toBeDefined()
      })
    })

    it('devrait avoir au moins une ability pour chaque classe', () => {
      Object.values(CHARACTER_CLASSES).forEach((cls: ClassInfo) => {
        expect(cls.abilities).toBeDefined()
        expect(cls.abilities.length).toBeGreaterThan(0)
      })
    })
  })

  describe('validateCharacterName (lib réel)', () => {
    it('devrait accepter les noms ASCII valides', () => {
      expect(validateCharacterName('Aragorn').valid).toBe(true)
      expect(validateCharacterName('Gandalf-le-Gris').valid).toBe(true)
      expect(validateCharacterName("Jean d'Arc").valid).toBe(true)
    })

    it('devrait accepter les accents français', () => {
      expect(validateCharacterName('Héros').valid).toBe(true)
      expect(validateCharacterName('François').valid).toBe(true)
      expect(validateCharacterName('Séléné').valid).toBe(true)
    })

    it('devrait rejeter un nom vide ou uniquement des espaces', () => {
      expect(validateCharacterName('').valid).toBe(false)
      expect(validateCharacterName('   ').valid).toBe(false)
      expect(validateCharacterName('').error).toBeDefined()
    })

    it('devrait rejeter les noms trop courts (< 3 caractères)', () => {
      expect(validateCharacterName('A').valid).toBe(false)
      expect(validateCharacterName('Ab').valid).toBe(false)
    })

    it('devrait rejeter les noms trop longs (> 20 caractères)', () => {
      expect(validateCharacterName('A'.repeat(21)).valid).toBe(false)
    })

    it('devrait rejeter les caractères spéciaux non autorisés', () => {
      expect(validateCharacterName('Gandalf@').valid).toBe(false)
      expect(validateCharacterName('Hero<3').valid).toBe(false)
      expect(validateCharacterName('Test!').valid).toBe(false)
      expect(validateCharacterName('user_name').valid).toBe(false) // underscore non autorisé
    })
  })

  describe('calculateRequiredXP (lib réel)', () => {
    it('devrait retourner 80 pour le niveau 1 (formule 80*1.35^0)', () => {
      expect(calculateRequiredXP(1)).toBe(80)
    })

    it('devrait retourner ~108 pour le niveau 2 (80*1.35^1)', () => {
      expect(calculateRequiredXP(2)).toBe(Math.floor(80 * Math.pow(1.35, 1)))
    })

    it('devrait être strictement croissant sur les 10 premiers niveaux', () => {
      for (let lvl = 1; lvl < 10; lvl++) {
        expect(calculateRequiredXP(lvl + 1)).toBeGreaterThan(calculateRequiredXP(lvl))
      }
    })

    it('devrait retourner un entier (floor)', () => {
      const xp = calculateRequiredXP(5)
      expect(Number.isInteger(xp)).toBe(true)
    })
  })

  describe('getTotalXPForLevel (lib réel)', () => {
    it('devrait retourner 0 pour le niveau 1', () => {
      expect(getTotalXPForLevel(1)).toBe(0)
    })

    it('devrait retourner 80 pour le niveau 2 (= calculateRequiredXP(1))', () => {
      expect(getTotalXPForLevel(2)).toBe(80)
    })

    it('devrait retourner 80 + 108 = 188 pour le niveau 3', () => {
      expect(getTotalXPForLevel(3)).toBe(80 + Math.floor(80 * Math.pow(1.35, 1)))
    })

    it('devrait être strictement croissant', () => {
      for (let lvl = 1; lvl < 5; lvl++) {
        expect(getTotalXPForLevel(lvl + 1)).toBeGreaterThan(getTotalXPForLevel(lvl))
      }
    })
  })

  describe('getClassAbilitiesWithInfo (lib réel)', () => {
    it('devrait retourner 3 abilities pour Guerrier (Rage, Coup Puissant, Défense de Fer)', () => {
      const abilities = getClassAbilitiesWithInfo('Guerrier')
      expect(abilities).toHaveLength(3)
      const names = abilities.map((a) => a.name)
      expect(names).toContain('Rage')
      expect(names).toContain('Coup Puissant')
      expect(names).toContain('Défense de Fer')
    })

    it('chaque ability devrait avoir name, description, type', () => {
      const abilities = getClassAbilitiesWithInfo('Mage')
      abilities.forEach((a) => {
        expect(a.name).toBeDefined()
        expect(a.description).toBeDefined()
        expect(a.description.length).toBeGreaterThan(0)
        expect(['OFFENSIVE', 'DEFENSIVE', 'PASSIVE', 'SUPPORT', 'UTILITY']).toContain(a.type)
      })
    })

    it('devrait retourner un tableau vide pour une classe inconnue', () => {
      const abilities = getClassAbilitiesWithInfo('Inconnue' as CharacterClass)
      expect(abilities).toEqual([])
    })
  })

  describe('getFormattedStats (lib réel)', () => {
    it('devrait retourner 4 entrées (une par stat)', () => {
      const stats: CharacterStats = { force: 8, agility: 5, magie: 3, endurance: 7 }
      const formatted = getFormattedStats(stats)
      expect(formatted).toHaveLength(4)
    })

    it('chaque entrée devrait contenir key, label, value, icon, color', () => {
      const stats: CharacterStats = { force: 8, agility: 5, magie: 3, endurance: 7 }
      const formatted = getFormattedStats(stats)

      formatted.forEach((entry) => {
        expect(['force', 'agility', 'magie', 'endurance']).toContain(entry.key)
        expect(entry.label).toBe(STAT_LABELS[entry.key])
        expect(entry.value).toBe(stats[entry.key])
        expect(entry.icon).toBeDefined()
        expect(entry.color).toBe(STAT_COLORS[entry.key])
      })
    })

    it('devrait inclure les bonnes valeurs pour Guerrier', () => {
      const guerrierStats = CHARACTER_CLASSES.Guerrier.baseStats
      const formatted = getFormattedStats(guerrierStats)
      const forceEntry = formatted.find((e) => e.key === 'force')
      expect(forceEntry?.value).toBe(8)
      expect(forceEntry?.label).toBe('Force')
    })
  })

  describe('Constantes UI', () => {
    it('STAT_LABELS devrait fournir les 4 libellés en français', () => {
      expect(STAT_LABELS.force).toBe('Force')
      expect(STAT_LABELS.agility).toBe('Agilité')
      expect(STAT_LABELS.magie).toBe('Magie')
      expect(STAT_LABELS.endurance).toBe('Endurance')
    })

    it('STAT_ICONS devrait fournir une icône pour chaque stat', () => {
      expect(STAT_ICONS.force).toBeDefined()
      expect(STAT_ICONS.agility).toBeDefined()
      expect(STAT_ICONS.magie).toBeDefined()
      expect(STAT_ICONS.endurance).toBeDefined()
    })

    it('STAT_COLORS devrait fournir une classe Tailwind pour chaque stat', () => {
      expect(STAT_COLORS.force).toMatch(/^text-/)
      expect(STAT_COLORS.agility).toMatch(/^text-/)
      expect(STAT_COLORS.magie).toMatch(/^text-/)
      expect(STAT_COLORS.endurance).toMatch(/^text-/)
    })

    it('CLASS_ICONS devrait fournir une icône pour chaque classe', () => {
      Object.keys(CHARACTER_CLASSES).forEach((cls) => {
        expect(CLASS_ICONS[cls as CharacterClass]).toBeDefined()
      })
    })

    it('DIFFICULTY_LABELS devrait mapper DEBUTANT/INTERMEDIAIRE/EXPERT', () => {
      expect(DIFFICULTY_LABELS.DEBUTANT.label).toBe('Débutant')
      expect(DIFFICULTY_LABELS.INTERMEDIAIRE.label).toBe('Intermédiaire')
      expect(DIFFICULTY_LABELS.EXPERT.label).toBe('Expert')
      expect(DIFFICULTY_LABELS.DEBUTANT.level).toBe(1)
      expect(DIFFICULTY_LABELS.EXPERT.level).toBe(3)
    })

    it('CLASS_DIFFICULTIES devrait avoir une entrée pour chaque classe', () => {
      Object.keys(CHARACTER_CLASSES).forEach((cls) => {
        const diff = CLASS_DIFFICULTIES[cls as CharacterClass]
        expect(diff).toBeDefined()
        expect(['DEBUTANT', 'INTERMEDIAIRE', 'EXPERT']).toContain(diff.level)
        expect(diff.reason.length).toBeGreaterThan(0)
      })
    })

    it('CLASS_PASSIVES devrait avoir un name et une description par classe', () => {
      Object.keys(CHARACTER_CLASSES).forEach((cls) => {
        const passive = CLASS_PASSIVES[cls as CharacterClass]
        expect(passive.name.length).toBeGreaterThan(0)
        expect(passive.description.length).toBeGreaterThan(0)
      })
    })

    it('ABILITIES_DATA devrait contenir les 3 abilities du Guerrier', () => {
      expect(ABILITIES_DATA.Rage).toBeDefined()
      expect(ABILITIES_DATA['Coup Puissant']).toBeDefined()
      expect(ABILITIES_DATA['Défense de Fer']).toBeDefined()
      expect(ABILITIES_DATA.Rage.type).toBe('OFFENSIVE')
      expect(ABILITIES_DATA['Défense de Fer'].type).toBe('DEFENSIVE')
    })
  })

  describe('leveling (lib réel) - fonctions pures', () => {
    it('getPrestigeTitle devrait retourner les 8 paliers en fonction du niveau', () => {
      expect(getPrestigeTitle(1)).toBe('Apprenti Aventurier')
      expect(getPrestigeTitle(14)).toBe('Apprenti Aventurier')
      expect(getPrestigeTitle(15)).toBe('Guerrier Prometteur')
      expect(getPrestigeTitle(24)).toBe('Guerrier Prometteur')
      expect(getPrestigeTitle(25)).toBe('Aventurier Confirmé')
      expect(getPrestigeTitle(40)).toBe('Vétéran Aguerri')
      expect(getPrestigeTitle(55)).toBe('Élite Légendaire')
      expect(getPrestigeTitle(70)).toBe('Maître Absolu')
      expect(getPrestigeTitle(85)).toBe('Seigneur Suprême')
      expect(getPrestigeTitle(100)).toBe('Légende Vivante')
      expect(getPrestigeTitle(200)).toBe('Légende Vivante')
    })

    it('getXPInCurrentLevel devrait retourner 0 au début d\'un niveau', () => {
      expect(getXPInCurrentLevel(1, 0)).toBe(0)
      expect(getXPInCurrentLevel(2, 80)).toBe(0) // 80 = palier pour passer niveau 2
    })

    it('getXPInCurrentLevel devrait retourner la valeur cumulée depuis le palier', () => {
      // Au niveau 2, on a passé le palier 80. Si on a 100 XP total, on en est à 20 dans le niveau.
      expect(getXPInCurrentLevel(2, 100)).toBe(20)
    })

    it('getXPInCurrentLevel ne devrait jamais retourner négatif', () => {
      expect(getXPInCurrentLevel(5, 0)).toBe(0)
    })

    it('getXPForNextLevel devrait être un alias de calculateRequiredXP', () => {
      expect(getXPForNextLevel(1)).toBe(calculateRequiredXP(1))
      expect(getXPForNextLevel(5)).toBe(calculateRequiredXP(5))
    })
  })
})
