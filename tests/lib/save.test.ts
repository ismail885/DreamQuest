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
    __setRejected: (err: unknown) => {
      ;(chain as { then: unknown }).then = (_resolve: (v: unknown) => void, reject: (e: unknown) => void) => reject(err)
    },
    __resetThen: () => {
      ;(chain as { then: unknown }).then = (resolve: (v: unknown) => void) => resolve(pending)
    },
    __clearCalls: () => {
      Object.values(chainMethods).forEach((fn) => fn.mockClear())
    },
  }

  // Make every chainable method return the full chain (with `then`)
  Object.values(chainMethods).forEach((fn) => fn.mockReturnValue(chain))

  return { supabase: chain }
})

import { supabase } from '@/lib/supabaseClient'
import { getUserSavesWithDetails, saveProgress } from '@/lib/saves'

const mockSupabase = supabase as unknown as {
  __setResolved: (v: { data?: unknown; error?: unknown }) => void
  __setRejected: (err: unknown) => void
  __resetThen: () => void
  __clearCalls: () => void
  from: jest.Mock
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  eq: jest.Mock
  order: jest.Mock
  limit: jest.Mock
  single: jest.Mock
  rpc: jest.Mock
}

describe('Unitaires - Sauvegardes (lib/saves.ts réel)', () => {
  beforeEach(() => {
    mockSupabase.__setResolved({ data: null, error: null })
    mockSupabase.__clearCalls()
  })

  describe('getUserSavesWithDetails', () => {
    it('devrait retourner un tableau vide en cas d\'erreur Supabase', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'DB error' } })

      const result = await getUserSavesWithDetails(1)

      expect(result).toEqual([])
    })

    it('devrait retourner [] si data est null (defensive)', async () => {
      mockSupabase.__setResolved({ data: null, error: null })

      const result = await getUserSavesWithDetails(1)

      expect(result).toEqual([])
    })

    it('devrait mapper les sauvegardes avec aventure_titre et personnage_nom', async () => {
      const dbRows = [
        {
          id: 1,
          id_utilisateur: 1,
          id_aventure: 10,
          id_personnage: 20,
          id_embranchement_actuel: 5,
          progression: 50,
          date_sauvegarde: '2026-03-29T10:00:00Z',
          aventure: { titre: 'La Quête du Dragon' },
          personnage: { nom_personnage: 'Aragorn' },
        },
      ]
      mockSupabase.__setResolved({ data: dbRows, error: null })

      const result = await getUserSavesWithDetails(1)

      expect(result).toHaveLength(1)
      expect(result[0].aventure_titre).toBe('La Quête du Dragon')
      expect(result[0].personnage_nom).toBe('Aragorn')
      expect(result[0].progression).toBe(50)
    })

    it('devrait gérer les relations nulles (aventure/personnage manquants)', async () => {
      const dbRows = [
        {
          id: 2,
          id_utilisateur: 1,
          id_aventure: 99,
          id_personnage: 99,
          id_embranchement_actuel: 1,
          progression: 0,
          date_sauvegarde: '2026-03-29T10:00:00Z',
          aventure: null,
          personnage: null,
        },
      ]
      mockSupabase.__setResolved({ data: dbRows, error: null })

      const result = await getUserSavesWithDetails(1)

      expect(result[0].aventure_titre).toBeUndefined()
      expect(result[0].personnage_nom).toBeUndefined()
    })
  })

  describe('saveProgress', () => {
    it('devrait INSERT une nouvelle sauvegarde quand le lookup ne retourne rien', async () => {
      mockSupabase.__setResolved({ data: null, error: null })

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

    it('devrait UPDATE une sauvegarde existante', async () => {
      mockSupabase.__setResolved({ data: { id: 99 }, error: null })

      const result = await saveProgress(1, 10, 20, 8, 80)

      expect(result).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        id_embranchement_actuel: 8,
        progression: 80,
      })
      expect(mockSupabase.insert).not.toHaveBeenCalled()
    })

    it('devrait retourner false si l\'insert signale une erreur', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'insert failed' } })

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(false)
    })

    it('devrait retourner false si l\'update signale une erreur', async () => {
      mockSupabase.__setResolved({ data: { id: 1 }, error: { message: 'update failed' } })

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(false)
    })

    it('devrait retourner false si le lookup jette (rejection propagée)', async () => {
      mockSupabase.__setRejected(new Error('lookup failed'))

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(false)
      mockSupabase.__resetThen()
    })
  })
})
