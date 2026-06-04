jest.mock('@/lib/supabaseClient', () => {
  let pending: { data: unknown; error: unknown } = { data: null, error: null }

  const chainMethods: Record<string, jest.Mock> = {
    from: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    single: jest.fn(),
    rpc: jest.fn(),
  }

  const chain: Record<string, unknown> = {
    ...chainMethods,
    then: (resolve: (v: unknown) => void) => resolve(pending),
    __setResolved: (value: { data?: unknown; error?: unknown }) => {
      pending = { data: value.data ?? null, error: value.error ?? null }
    },
    __clearCalls: () => {
      Object.values(chainMethods).forEach((fn) => fn.mockClear())
    },
  }

  Object.values(chainMethods).forEach((fn) => fn.mockReturnValue(chain))

  return { supabase: chain }
})

import { supabase } from '@/lib/supabaseClient'
import { saveProgress, getUserSavesWithDetails } from '@/lib/saves'

const mockSupabase = supabase as unknown as {
  __setResolved: (v: { data?: unknown; error?: unknown }) => void
  __clearCalls: () => void
  from: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  eq: jest.Mock
  order: jest.Mock
}

describe('Intégration - Sauvegarde (lib/saves.ts réel)', () => {
  beforeEach(() => {
    mockSupabase.__setResolved({ data: null, error: null })
    mockSupabase.__clearCalls()
  })

  describe('Flux: Nouvelle sauvegarde (insert)', () => {
    it('devrait faire un insert quand aucune sauvegarde n\'existe pour ce user/adventure/character', async () => {
      mockSupabase.__setResolved({ data: null, error: null }) // lookup: no existing save

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(true)
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        id_utilisateur: 1,
        id_aventure: 10,
        id_personnage: 20,
        id_embranchement_actuel: 5,
        progression: 50,
      })
      expect(mockSupabase.update).not.toHaveBeenCalled()
    })
  })

  describe('Flux: Mise à jour de sauvegarde (upsert)', () => {
    it('devrait faire un update quand une sauvegarde existe déjà', async () => {
      mockSupabase.__setResolved({ data: { id: 7 }, error: null }) // lookup: existing save

      const result = await saveProgress(1, 10, 20, 9, 90)

      expect(result).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        id_embranchement_actuel: 9,
        progression: 90,
      })
      expect(mockSupabase.insert).not.toHaveBeenCalled()
    })
  })

  describe('Flux: Gestion d\'erreur DB', () => {
    it('devrait retourner false en cas d\'erreur sur insert', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'FK violation' } })

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(false)
    })

    it('devrait retourner false en cas d\'erreur sur update', async () => {
      mockSupabase.__setResolved({ data: { id: 1 }, error: { message: 'update failed' } })

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(false)
    })
  })

  describe('Flux: Liste des sauvegardes utilisateur', () => {
    it('devrait retourner la liste ordonnée par date desc', async () => {
      const rows = [
        {
          id: 1, id_utilisateur: 1, id_aventure: 10, id_personnage: 20,
          id_embranchement_actuel: 5, progression: 50,
          date_sauvegarde: '2026-03-29T10:00:00Z',
          aventure: { titre: 'Aventure A' },
          personnage: { nom_personnage: 'Hero' },
        },
        {
          id: 2, id_utilisateur: 1, id_aventure: 11, id_personnage: 21,
          id_embranchement_actuel: 3, progression: 30,
          date_sauvegarde: '2026-03-28T10:00:00Z',
          aventure: { titre: 'Aventure B' },
          personnage: { nom_personnage: 'Hero2' },
        },
      ]
      mockSupabase.__setResolved({ data: rows, error: null })

      const result = await getUserSavesWithDetails(1)

      expect(result).toHaveLength(2)
      expect(result[0].aventure_titre).toBe('Aventure A')
      expect(result[0].personnage_nom).toBe('Hero')
      expect(result[1].aventure_titre).toBe('Aventure B')
      // Order by date desc was passed
      expect(mockSupabase.order).toHaveBeenCalledWith('date_sauvegarde', { ascending: false })
    })

    it('devrait retourner [] si la requête échoue', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'DB error' } })

      const result = await getUserSavesWithDetails(1)

      expect(result).toEqual([])
    })

    it('devrait appeler eq() avec l\'id_utilisateur', async () => {
      mockSupabase.__setResolved({ data: [], error: null })

      await getUserSavesWithDetails(42)

      // The first eq call should be on id_utilisateur with the value 42
      expect(mockSupabase.eq).toHaveBeenCalledWith('id_utilisateur', 42)
    })
  })
})
