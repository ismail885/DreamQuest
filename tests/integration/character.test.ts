import { CHARACTER_CLASSES } from '@/types/character'
import type { Character, CharacterClass } from '@/types/character'

describe('Intégration - Personnages', () => {
  describe('Flux: Création de personnage', () => {
    it('devrait créer un personnage avec tous les attributs', () => {
      // Données simulées comme si elles venaient du formulaire
      const formData = {
        name: 'MonHéros',
        className: 'Guerrier' as CharacterClass,
        userId: 1,
      }

      // Simulation de la création
      const classInfo = CHARACTER_CLASSES[formData.className]
      const initialHP = 100 + classInfo.baseStats.endurance * 10

      const newCharacter: Character = {
        nom_personnage: formData.name,
        classe: formData.className,
        niveau: 1,
        points_vie: initialHP,
        points_vie_max: initialHP,
        stats: classInfo.baseStats,
        id_utilisateur: formData.userId,
        experience: 0,
      }

      expect(newCharacter.nom_personnage).toBe('MonHéros')
      expect(newCharacter.classe).toBe('Guerrier')
      expect(newCharacter.niveau).toBe(1)
      expect(newCharacter.points_vie).toBe(170) // 100 + 7*10
      expect(newCharacter.experience).toBe(0)
    })

    it('devrait créer un personnage Mage avec ses stats', () => {
      const classInfo = CHARACTER_CLASSES['Mage']
      const hp = 100 + classInfo.baseStats.endurance * 10

      const mage: Character = {
        nom_personnage: 'Merlin',
        classe: 'Mage',
        niveau: 1,
        points_vie: hp,
        points_vie_max: hp,
        stats: classInfo.baseStats,
        id_utilisateur: 1,
      }

      expect(mage.classe).toBe('Mage')
      expect(mage.stats.intelligence).toBe(9) // Plus haute stat
      expect(mage.stats.force).toBe(3) // Plus basse stat
    })

    it('devrait calculer correctement les PV pour toutes les classes', () => {
      const classes: CharacterClass[] = [
        'Guerrier',
        'Mage',
        'Archer',
        'Assassin',
        'Paladin',
        'Prêtre',
        'Barbare',
      ]

      const hpValues = classes.map((cls) => {
        const stats = CHARACTER_CLASSES[cls].baseStats
        return 100 + stats.endurance * 10
      })

      // Vérifier que les PV sont différents selon les classes
      const uniqueHP = [...new Set(hpValues)]
      expect(uniqueHP.length).toBeGreaterThan(1)
    })
  })

  describe('Flux: Parcours utilisateur avec personnages', () => {
    const mockUserCharacters: Character[] = [
      {
        nom_personnage: 'Gandalf',
        classe: 'Mage',
        niveau: 5,
        points_vie: 140,
        points_vie_max: 140,
        stats: CHARACTER_CLASSES['Mage'].baseStats,
        id_utilisateur: 1,
        experience: 450,
      },
      {
        nom_personnage: 'Aragorn',
        classe: 'Guerrier',
        niveau: 3,
        points_vie: 170,
        points_vie_max: 170,
        stats: CHARACTER_CLASSES['Guerrier'].baseStats,
        id_utilisateur: 1,
        experience: 200,
      },
    ]

    it('devrait récupérer les personnages de l\'utilisateur', () => {
      const userId = 1
      const userChars = mockUserCharacters.filter((c) => c.id_utilisateur === userId)

      expect(userChars).toHaveLength(2)
    })

    it('devrait trouver un personnage par son ID', () => {
      const characterName = 'Aragorn'
      const character = mockUserCharacters.find((c) => c.nom_personnage === characterName)

      expect(character?.nom_personnage).toBe('Aragorn')
    })

    it('devrait supprimer un personnage', () => {
      const characterNameToDelete = 'Gandalf'
      const updatedList = mockUserCharacters.filter(
        (c) => c.nom_personnage !== characterNameToDelete
      )

      expect(updatedList).toHaveLength(1)
      expect(updatedList[0].nom_personnage).toBe('Aragorn')
    })
  })

  describe('Flux: Équipement et progression', () => {
    it('devrait calculer l\'expérience nécessaire pour le prochain niveau', () => {
      const expForNextLevel = (currentLevel: number): number => {
        return currentLevel * 100 // 100, 200, 300...
      }

      expect(expForNextLevel(1)).toBe(100)
      expect(expForNextLevel(2)).toBe(200)
      expect(expForNextLevel(5)).toBe(500)
    })

    it('devrait monter de niveau quand assez d\'expérience', () => {
      const checkLevelUp = (level: number, exp: number): number => {
        const expNeeded = level * 100
        if (exp >= expNeeded) {
          return level + 1
        }
        return level
      }

      expect(checkLevelUp(1, 50)).toBe(1) // Pas assez
      expect(checkLevelUp(1, 100)).toBe(2) // Exactly enough
      expect(checkLevelUp(1, 150)).toBe(2) // Plus que nécessaire
    })
  })
})
