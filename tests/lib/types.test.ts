import type { Adventure, Branch, AdventureWithAuthor } from '@/types/adventure'

describe('Types - Adventure', () => {
  describe('Adventure', () => {
    it('devrait créer un objet Adventure valide', () => {
      const adventure: Adventure = {
        id: 1,
        titre: 'Ma Super Aventure',
        description: 'Une aventure incroyable',
        auteur_id: 1,
        date_creation: '2026-01-01',
        popularite: 10,
        embranchement_initial_id: 1,
      }

      expect(adventure.id).toBe(1)
      expect(adventure.titre).toBe('Ma Super Aventure')
      expect(adventure.description).toBe('Une aventure incroyable')
      expect(adventure.auteur_id).toBe(1)
      expect(adventure.popularite).toBe(10)
    })

    it('devrait accepter des valeurs nulles pour les champs optionnels', () => {
      const adventure: Adventure = {
        id: 1,
        titre: 'Aventure minimale',
        description: null,
        auteur_id: null,
        date_creation: '2026-01-01',
        popularite: 0,
        embranchement_initial_id: null,
      }

      expect(adventure.description).toBeNull()
      expect(adventure.auteur_id).toBeNull()
      expect(adventure.embranchement_initial_id).toBeNull()
    })
  })

  describe('Branch', () => {
    it('devrait créer un objet Branch valide', () => {
      const branch: Branch = {
        id: 1,
        texte: 'Vous trouvez une épée brillante.',
        choix1: 'Prendre l\'épée',
        choix1_lien: 2,
        choix2: 'Ignorer l\'épée',
        choix2_lien: 3,
        id_aventure: 1,
      }

      expect(branch.id).toBe(1)
      expect(branch.choix1).toBe('Prendre l\'épée')
      expect(branch.choix1_lien).toBe(2)
      expect(branch.choix2_lien).toBe(3)
    })

    it('devrait détecter une fin de branche (pas de choix)', () => {
      const endBranch: Branch = {
        id: 99,
        texte: 'Fin de l\'aventure.',
        choix1: 'Recommencer',
        choix1_lien: null,
        choix2: '',
        choix2_lien: null,
        id_aventure: 1,
      }

      expect(endBranch.choix1_lien).toBeNull()
      expect(endBranch.choix2_lien).toBeNull()
    })
  })

  describe('AdventureWithAuthor', () => {
    it('devrait étendre Adventure avec auteur_nom', () => {
      const adventureWithAuthor: AdventureWithAuthor = {
        id: 1,
        titre: 'Aventure avec auteur',
        description: 'Description',
        auteur_id: 1,
        date_creation: '2026-01-01',
        popularite: 5,
        embranchement_initial_id: 1,
        auteur_nom: 'Ismail',
      }

      expect(adventureWithAuthor.auteur_nom).toBe('Ismail')
      expect(adventureWithAuthor.popularite).toBe(5)
    })

    it('devrait fonctionner sans auteur_nom', () => {
      const adventure: AdventureWithAuthor = {
        id: 1,
        titre: 'Aventure',
        description: null,
        auteur_id: null,
        date_creation: '2026-01-01',
        popularite: 0,
        embranchement_initial_id: null,
      }

      expect(adventure.auteur_nom).toBeUndefined()
    })
  })

  describe('Validation functions', () => {
    // Helper functions simulées pour les tests
    const isValidAdventure = (adventure: Partial<Adventure>): boolean => {
      return !!(adventure.id && adventure.titre && adventure.date_creation)
    }

    const isEndBranch = (branch: Branch): boolean => {
      return !branch.choix1_lien && !branch.choix2_lien
    }

    it('devrait valider une aventure complète', () => {
      const adventure = {
        id: 1,
        titre: 'Test',
        date_creation: '2026-01-01',
      }

      expect(isValidAdventure(adventure)).toBe(true)
    })

    it('devrait rejeter une aventure invalide', () => {
      const adventure = {
        id: 1,
        titre: '',
        date_creation: '2026-01-01',
      }

      expect(isValidAdventure(adventure)).toBe(false)
    })

    it('devrait détecter une fin de branche', () => {
      const endBranch: Branch = {
        id: 1,
        texte: 'Fin',
        choix1: '',
        choix1_lien: null,
        choix2: '',
        choix2_lien: null,
        id_aventure: 1,
      }

      expect(isEndBranch(endBranch)).toBe(true)
    })

    it('devrait détecter une branche non-terminée', () => {
      const continueBranch: Branch = {
        id: 1,
        texte: 'Suite',
        choix1: 'Continuer',
        choix1_lien: 2,
        choix2: 'Retourner',
        choix2_lien: 3,
        id_aventure: 1,
      }

      expect(isEndBranch(continueBranch)).toBe(false)
    })
  })
})
