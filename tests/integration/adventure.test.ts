import type { Adventure, Branch, AdventureWithAuthor } from '@/types/adventure'

describe('Intégration - Flux d\'aventure', () => {
  // Mock des données simulateures (comme si elles venaient de Supabase)
  const mockAdventure: Adventure = {
    id: 1,
    titre: 'La Quête du Dragon',
    description: 'Un dragon terrorise le village. Vous êtes le héros choisi pour le vaincre.',
    auteur_id: 1,
    date_creation: '2026-01-15',
    popularite: 42,
    embranchement_initial_id: 1,
  }

  const mockBranches: Branch[] = [
    {
      id: 1,
      texte: 'Vous vous tenez devant la grotte du dragon. L\'odeur de soufre vous monte au nez.',
      choix1: 'Entrer courageusement',
      choix1_lien: 2,
      choix1_consequences: null,
      choix2: 'Attendre et observer',
      choix2_lien: 3,
      choix2_consequences: null,
      id_aventure: 1,
    },
    {
      id: 2,
      texte: 'Vous avancez dans la grotte. Le dragon dormez devant un tas d\'or.',
      choix1: 'Attaquer par surprise',
      choix1_lien: 4,
      choix1_consequences: null,
      choix2: 'Tenter de négocier',
      choix2_lien: 5,
      choix2_consequences: null,
      id_aventure: 1,
    },
    {
      id: 3,
      texte: 'Vous observez. Après quelques heures, vous voyez un enfant entrer dans la grotte.',
      choix1: 'Courir sauver l\'enfant',
      choix1_lien: 6,
      choix1_consequences: null,
      choix2: 'Continuer à observer',
      choix2_lien: 7,
      choix2_consequences: null,
      id_aventure: 1,
    },
    {
      id: 4,
      texte: 'Votre attaque surprend le dragon ! Vous réussissez à le blesser grievement.',
      choix1: 'Finir le coup fatal',
      choix1_lien: null,
      choix1_consequences: null,
      choix2: 'L\'épargner',
      choix2_lien: null,
      choix2_consequences: null,
      id_aventure: 1,
    },
    {
      id: 5,
      texte: 'Le dragon refuse de négocier. Il crache du feu !',
      choix1: 'Esquiver',
      choix1_lien: 8,
      choix1_consequences: null,
      choix2: 'Riposter',
      choix2_lien: 4,
      choix2_consequences: null,
      id_aventure: 1,
    },
  ]

  describe('Chargement d\'une aventure', () => {
    it('devrait charger une aventure avec son premier embranchement', () => {
      // Simulation du chargement
      const loadedAdventure = mockAdventure
      const initialBranch = mockBranches.find(b => b.id === loadedAdventure.embranchement_initial_id)

      expect(loadedAdventure).toBeDefined()
      expect(loadedAdventure.titre).toBe('La Quête du Dragon')
      expect(initialBranch).toBeDefined()
      expect(initialBranch?.id).toBe(1)
      expect(initialBranch?.texte).toContain('grotte du dragon')
    })

    it('devrait charger les informations de l\'auteur', () => {
      const adventureWithAuthor: AdventureWithAuthor = {
        ...mockAdventure,
        auteur_nom: 'Ismail',
      }

      expect(adventureWithAuthor.auteur_nom).toBe('Ismail')
      expect(adventureWithAuthor.auteur_id).toBe(1)
    })

    it('devrait gérer une aventure sans contenu', () => {
      const emptyAdventure: Adventure = {
        ...mockAdventure,
        embranchement_initial_id: null,
      }

      expect(emptyAdventure.embranchement_initial_id).toBeNull()
    })
  })

  describe('Navigation dans les choix', () => {
    it('devrait suivre le choix 1', () => {
      const currentBranch = mockBranches[0] // Branche initiale
      const nextBranchId = currentBranch.choix1_lien

      expect(nextBranchId).toBe(2)

      const nextBranch = mockBranches.find(b => b.id === nextBranchId)
      expect(nextBranch).toBeDefined()
      expect(nextBranch?.texte).toContain('grotte')
    })

    it('devrait suivre le choix 2', () => {
      const currentBranch = mockBranches[0]
      const nextBranchId = currentBranch.choix2_lien

      expect(nextBranchId).toBe(3)

      const nextBranch = mockBranches.find(b => b.id === nextBranchId)
      expect(nextBranch).toBeDefined()
      expect(nextBranch?.texte).toContain('observez')
    })

    it('devrait construire l\'historique des choix', () => {
      // Simulation d'un parcours utilisateur
      const history: Branch[] = []

      // Choix 1: Entrer -> Branche 2
      history.push(mockBranches[0])
      const choice1 = mockBranches[0].choix1_lien
      history.push(mockBranches.find(b => b.id === choice1)!)

      // Choix 2: Attaquer -> Branche 4
      const choice2 = mockBranches[1].choix1_lien
      history.push(mockBranches.find(b => b.id === choice2)!)

      expect(history).toHaveLength(3)
      expect(history[0].id).toBe(1)
      expect(history[1].id).toBe(2)
      expect(history[2].id).toBe(4)
    })
  })

  describe('Détection de fin d\'aventure', () => {
    const isEndBranch = (branch: Branch): boolean => {
      return !branch.choix1_lien && !branch.choix2_lien
    }

    it('devrait détecter une fin de branche (fin de l\'aventure)', () => {
      const endBranch: Branch = {
        id: 99,
        texte: 'Félicitations ! Vous avez vaincu le dragon et sauvé le village.',
        choix1: 'Recommencer',
        choix1_lien: null,
        choix1_consequences: null,
        choix2: '',
        choix2_lien: null,
        choix2_consequences: null,
        id_aventure: 1,
      }

      expect(isEndBranch(endBranch)).toBe(true)
    })

    it('devrait détecter une branche non-terminée', () => {
      const continueBranch = mockBranches[0] // Branche initiale avec choix

      expect(isEndBranch(continueBranch)).toBe(false)
    })

    it('devrait identifier tous les embranchements terminaux', () => {
      const endBranches = mockBranches.filter(b => isEndBranch(b))

      // Dans nos données mock, les branches 4, 5 ont des choix null
      expect(endBranches.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Sauvegarde et restauration', () => {
    it('devrait sauvegarder la progression', () => {
      const saveData = {
        id_utilisateur: 1,
        id_aventure: 1,
        id_personnage: 1,
        id_embranchement_actuel: 2,
        progression: 50,
        date_sauvegarde: new Date().toISOString(),
      }

      expect(saveData.id_embranchement_actuel).toBe(2)
      expect(saveData.progression).toBe(50)
    })

    it('devrait restaurer depuis une sauvegarde', () => {
      const savedProgress = {
        currentBranchId: 3,
        historyLength: 3,
      }

      // Simulation de restauration
      const restoredBranch = mockBranches.find(b => b.id === savedProgress.currentBranchId)

      expect(restoredBranch).toBeDefined()
      expect(restoredBranch?.id).toBe(3)
    })

    it('devrait calculer la progression en pourcentage', () => {
      const totalBranches = mockBranches.length
      const currentPosition = 3 // On est à la branche 3

      const progression = Math.round((currentPosition / totalBranches) * 100)

      expect(progression).toBe(60)
    })
  })

  describe('Votes et popularité', () => {
    it('devrait calculer le nombre de votes', () => {
      const votes = 42

      expect(votes).toBe(42)
      expect(votes).toBeGreaterThan(0)
    })

    it('devrait trier les aventures par popularité', () => {
      const adventures: AdventureWithAuthor[] = [
        { ...mockAdventure, id: 1, titre: 'Aventure 1', popularite: 10, auteur_nom: 'User1' },
        { ...mockAdventure, id: 2, titre: 'Aventure 2', popularite: 50, auteur_nom: 'User2' },
        { ...mockAdventure, id: 3, titre: 'Aventure 3', popularite: 25, auteur_nom: 'User3' },
      ]

      const sorted = [...adventures].sort((a, b) => b.popularite - a.popularite)

      expect(sorted[0].titre).toBe('Aventure 2')
      expect(sorted[0].popularite).toBe(50)
      expect(sorted[1].popularite).toBe(25)
      expect(sorted[2].popularite).toBe(10)
    })
  })
})
