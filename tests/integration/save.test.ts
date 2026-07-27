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

  describe('Flux: Nouvelle sauvegarde (POST /api/saves)', () => {
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
        json: () => Promise.resolve({ error: 'Erreur de sauvegarde' }),
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
