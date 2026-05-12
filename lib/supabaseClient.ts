import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types/user'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env')
}

// ==============================================================
// Cache memoization simple (4.3)
// ==============================================================
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const queryCache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 30_000 // 30 secondes

function getCacheKey(table: string, query: string): string {
  return `${table}:${query}`
}

function getFromCache<T>(key: string): T | null {
  const entry = queryCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    queryCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  queryCache.set(key, { data, timestamp: Date.now() })

  // Nettoyer les entrees expirees si le cache depasse 100 entrees
  if (queryCache.size > 100) {
    const now = Date.now()
    for (const [k, v] of queryCache) {
      if (now - v.timestamp > CACHE_TTL) queryCache.delete(k)
    }
  }
}

export function clearCache(): void {
  queryCache.clear()
}

// ==============================================================
// Retry automatique (4.4)
// ==============================================================
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        // Attente exponentielle : 1s, 2s
        await new Promise(r => setTimeout(r, (attempt + 1) * 1000))
      }
    }
  }

  throw lastError
}

// ==============================================================
// Client ANON (publique)
// ==============================================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Wrapper avec cache + retry pour les SELECTs frequents
export async function cachedSelect<T>(
  table: string,
  query: string,
  fetcher: () => Promise<{ data: T | null; error: unknown }>
): Promise<{ data: T | null; error: unknown }> {
  const cacheKey = getCacheKey(table, query)
  const cached = getFromCache<T>(cacheKey)
  if (cached !== null) return { data: cached, error: null }

  return withRetry(async () => {
    const result = await fetcher()
    if (result.data && !result.error) {
      setCache(cacheKey, result.data)
    }
    return result
  })
}

// ==============================================================
// Client ADMIN / SERVER-SIDE (4.2)
// ==============================================================
let adminClient: SupabaseClient | null = null

/**
 * Cree un client Supabase avec la SERVICE_ROLE_KEY.
 * Utilisable UNIQUEMENT cote serveur (API Routes, Server Actions).
 * Ne JAMAIS appeler depuis un composant client.
 */
export function createAdminClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient() ne peut etre appele que cote serveur')
  }

  if (adminClient) return adminClient

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env')
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}

// Re-export des types depuis le dossier types/ (4.1)
export type { UserRole }
