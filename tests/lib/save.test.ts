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

// Les cas d'erreur testes ici journalisent volontairement via console.error :
// on neutralise la sortie pour garder le rapport Jest lisible, sans toucher
// au code de production qui doit continuer a journaliser en conditions reelles.
let consoleErrorSpy: jest.SpyInstance

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})

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
    let fetchMock: jest.SpyInstance

    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as unknown as Response)
    })

    afterEach(() => {
      fetchMock.mockRestore()
    })

    it('devrait POSTer vers /api/saves et retourner true si ok', async () => {
      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(true)
      expect(fetchMock).toHaveBeenCalledWith('/api/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adventureId: 10, characterId: 20, currentBranchId: 5, progression: 50 }),
      })
    })

    it('devrait retourner false si l\'API répond avec une erreur', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'DB error' }),
      } as unknown as Response)

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(false)
    })

    it('devrait retourner false si fetch jette une exception', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'))

      const result = await saveProgress(1, 10, 20, 5, 50)

      expect(result).toBe(false)
    })
  })
})
