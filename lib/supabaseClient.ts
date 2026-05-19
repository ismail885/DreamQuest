import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types/user'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const REQUEST_TIMEOUT = 15_000; // 15 secondes

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// Client ANON (publique) - Initialisation lazy pour eviter le crash au build
// ==============================================================
let _supabase: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables Supabase manquantes dans .env')
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: fetchWithTimeout,
      },
    })
  }
  return _supabase
}

// Export compatible avec l'usage existant `import { supabase } from ...`
// On utilise un Proxy pour initialiser lazy au premier acces
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = Reflect.get(client, prop)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

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