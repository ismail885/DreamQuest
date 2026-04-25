import type { Character, CharacterClass, ClassInfo } from '@/types/character'
import { CHARACTER_CLASSES, STAT_LABELS } from '@/types/character'

describe('Unitaires - Personnages', () => {
  describe('CHARACTER_CLASSES', () => {
    it('devrait avoir 10 classes', () => {
      const classes = Object.keys(CHARACTER_CLASSES)
      expect(classes).toHaveLength(10)
    })

    it('devrait contenir les classes principales', () => {
      expect(CHARACTER_CLASSES).toHaveProperty('Guerrier')
      expect(CHARACTER_CLASSES).toHaveProperty('Mage')
      expect(CHARACTER_CLASSES).toHaveProperty('Archer')
      expect(CHARACTER_CLASSES).toHaveProperty('Assassin')
      expect(CHARACTER_CLASSES).toHaveProperty('Paladin')
      expect(CHARACTER_CLASSES).toHaveProperty('Prêtre')
    })

    it('devrait avoir une description pour chaque classe', () => {
      Object.values(CHARACTER_CLASSES).forEach((cls: ClassInfo) => {
        expect(cls.description).toBeDefined()
        expect(cls.description.length).toBeGreaterThan(0)
      })
    })

    it('devrait avoir des stats de base pour chaque classe', () => {
      Object.values(CHARACTER_CLASSES).forEach((cls: ClassInfo) => {
        expect(cls.baseStats).toBeDefined()
        expect(cls.baseStats.force).toBeGreaterThan(0)
        expect(cls.baseStats.agility).toBeGreaterThan(0)
        expect(cls.baseStats.intelligence).toBeGreaterThan(0)
        expect(cls.baseStats.endurance).toBeGreaterThan(0)
      })
    })

    it('devrait avoir des abilities pour chaque classe', () => {
      Object.values(CHARACTER_CLASSES).forEach((cls: ClassInfo) => {
        expect(cls.abilities).toBeDefined()
        expect(cls.abilities.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Calcul des points de vie', () => {
    const calculateInitialHP = (classe: CharacterClass): number => {
      const classInfo = CHARACTER_CLASSES[classe]
      return 100 + (classInfo.baseStats.endurance * 10)
    }

    it('devrait calculer les PV pour Guerrier (endurance 7)', () => {
      const hp = calculateInitialHP('Guerrier')
      expect(hp).toBe(170) // 100 + 7*10
    })

    it('devrait calculer les PV pour Mage (endurance 4)', () => {
      const hp = calculateInitialHP('Mage')
      expect(hp).toBe(140) // 100 + 4*10
    })

    it('devrait calculer les PV pour Barbare (endurance 8)', () => {
      const hp = calculateInitialHP('Barbare')
      expect(hp).toBe(180) // 100 + 8*10
    })

    it('devrait calculer les PV pour Nécromancien (endurance 3)', () => {
      const hp = calculateInitialHP('Nécromancien')
      expect(hp).toBe(130) // 100 + 3*10
    })
  })

  describe('Validation du nom du personnage', () => {
    const isValidCharacterName = (name: string): boolean => {
      if (!name || name.trim().length === 0) return false
      if (name.trim().length < 2) return false
      if (name.trim().length > 50) return false
      return /^[a-zA-Z0-9\s\-_]+$/.test(name)
    }

    it('devrait accepter un nom valide', () => {
      expect(isValidCharacterName('Aragorn')).toBe(true)
      expect(isValidCharacterName('Gandalf-le-Gris')).toBe(true)
      expect(isValidCharacterName('Legolas 007')).toBe(true)
    })

    it('devrait rejeter un nom vide', () => {
      expect(isValidCharacterName('')).toBe(false)
      expect(isValidCharacterName('   ')).toBe(false)
    })

    it('devrait rejeter un nom trop court', () => {
      expect(isValidCharacterName('A')).toBe(false)
    })

    it('devrait rejeter un nom trop long', () => {
      expect(isValidCharacterName('A'.repeat(51))).toBe(false)
    })

    it('devrait rejeter les caractères spéciaux interdits', () => {
      expect(isValidCharacterName('Gandalf@')).toBe(false)
      expect(isValidCharacterName('Hero<3')).toBe(false)
      expect(isValidCharacterName('Test!')).toBe(false)
    })
  })

  describe('STAT_LABELS', () => {
    it('devrait avoir les 4 labels', () => {
      expect(STAT_LABELS.force).toBe('Force')
      expect(STAT_LABELS.agility).toBe('Agilité')
      expect(STAT_LABELS.intelligence).toBe('Intelligence')
      expect(STAT_LABELS.endurance).toBe('Endurance')
    })
  })

  describe('Character type', () => {
    it('devrait créer un personnage valide', () => {
      const character: Character = {
        nom_personnage: 'Héros',
        classe: 'Guerrier',
        niveau: 1,
        points_vie: 170,
        points_vie_max: 170,
        stats: { force: 8, agility: 5, intelligence: 3, endurance: 7 },
        id_utilisateur: 1,
        experience: 0,
      }

      expect(character.nom_personnage).toBe('Héros')
      expect(character.classe).toBe('Guerrier')
      expect(character.niveau).toBe(1)
    })

    it('devrait calculer le niveau suivant avec expérience', () => {
      const calculateNextLevel = (exp: number): number => {
        // Formule: niveau = sqrt(exp/100) + 1
        return Math.floor(Math.sqrt(exp / 100)) + 1
      }

      expect(calculateNextLevel(0)).toBe(1)
      expect(calculateNextLevel(99)).toBe(1)
      expect(calculateNextLevel(100)).toBe(2)
      expect(calculateNextLevel(400)).toBe(3)
      expect(calculateNextLevel(900)).toBe(4)
    })
  })
})
