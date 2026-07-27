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
import {
  getAdventureWithAuthor,
  getAllAdventuresWithAuthors,
  getTopAdventures,
  getBranchById,
} from '@/lib/adventures'

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
  select: jest.Mock
  eq: jest.Mock
  order: jest.Mock
  limit: jest.Mock
  single: jest.Mock
}

describe('Intégration - Aventure (lib/adventures.ts réel)', () => {
  beforeEach(() => {
    mockSupabase.__setResolved({ data: null, error: null })
    mockSupabase.__clearCalls()
  })

  describe('getAdventureWithAuthor', () => {
    it('devrait retourner null en cas d\'erreur Supabase', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'not found' } })

      const result = await getAdventureWithAuthor(99)

      expect(result).toBeNull()
    })

    it('devrait retourner null si data est null (defensive)', async () => {
      mockSupabase.__setResolved({ data: null, error: null })

      const result = await getAdventureWithAuthor(99)

      expect(result).toBeNull()
    })

    it('devrait mapper l\'aventure avec auteur_nom', async () => {
      const row = {
        id: 1,
        titre: 'La Quête du Dragon',
        description: 'Un dragon terrorise le village',
        auteur_id: 7,
        date_creation: '2026-01-15',
        popularite: 42,
        utilisateur: { nom_utilisateur: 'Ismail' },
      }
      mockSupabase.__setResolved({ data: row, error: null })

      const result = await getAdventureWithAuthor(1)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(1)
      expect(result?.titre).toBe('La Quête du Dragon')
      expect(result?.auteur_nom).toBe('Ismail')
    })

    it('devrait gérer un utilisateur null (auteur_id sans row utilisateur jointe)', async () => {
      const row = {
        id: 2,
        titre: 'Aventure orpheline',
        description: null,
        auteur_id: null,
        date_creation: '2026-01-15',
        popularite: 0,
        utilisateur: null,
      }
      mockSupabase.__setResolved({ data: row, error: null })

      const result = await getAdventureWithAuthor(2)

      expect(result?.auteur_nom).toBeUndefined()
    })
  })

  describe('getAllAdventuresWithAuthors', () => {
    it('devrait retourner [] si la requête échoue', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'oops' } })

      const result = await getAllAdventuresWithAuthors()

      expect(result).toEqual([])
    })

    it('devrait retourner [] si data est null', async () => {
      mockSupabase.__setResolved({ data: null, error: null })

      const result = await getAllAdventuresWithAuthors()

      expect(result).toEqual([])
    })

    it('devrait mapper la liste avec auteur_nom', async () => {
      const rows = [
        { id: 1, titre: 'A', description: 'a', auteur_id: 1, date_creation: '2026-01-01', popularite: 5, utilisateur: { nom_utilisateur: 'alice' } },
        { id: 2, titre: 'B', description: null, auteur_id: 2, date_creation: '2026-01-02', popularite: 10, utilisateur: { nom_utilisateur: 'bob' } },
      ]
      mockSupabase.__setResolved({ data: rows, error: null })

      const result = await getAllAdventuresWithAuthors()

      expect(result).toHaveLength(2)
      expect(result[0].auteur_nom).toBe('alice')
      expect(result[1].auteur_nom).toBe('bob')
    })
  })

  describe('getTopAdventures', () => {
    it('devrait retourner [] si la requête échoue', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'oops' } })

      const result = await getTopAdventures(5)

      expect(result).toEqual([])
    })

    it('devrait retourner la liste mappée avec la limite fournie', async () => {
      const rows = [
        { id: 1, titre: 'Top', description: null, auteur_id: 1, date_creation: '2026-01-01', popularite: 100, utilisateur: { nom_utilisateur: 'u1' } },
      ]
      mockSupabase.__setResolved({ data: rows, error: null })

      await getTopAdventures(3)

      // The query was called with the limit
      expect(mockSupabase.limit).toHaveBeenCalledWith(3)
      // Order is by popularite desc
      expect(mockSupabase.order).toHaveBeenCalledWith('popularite', { ascending: false })
    })
  })

  describe('getBranchById', () => {
    it('devrait retourner null en cas d\'erreur', async () => {
      mockSupabase.__setResolved({ data: null, error: { message: 'not found' } })

      const result = await getBranchById(99)

      expect(result).toBeNull()
    })

    it('devrait retourner les données de l\'embranchement', async () => {
      const row = {
        id: 5,
        texte: 'Vous entrez dans la grotte...',
        choix1: 'Continuer',
        choix1_lien: 6,
        choix1_consequences: null,
        choix2: 'Retourner',
        choix2_lien: 1,
        choix2_consequences: null,
        id_aventure: 1,
      }
      mockSupabase.__setResolved({ data: row, error: null })

      const result = await getBranchById(5)

      expect(result).toEqual(row)
    })
  })
})
