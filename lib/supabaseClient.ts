import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types/user'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env')
}

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

// Client ANON (publique)
// ==============================================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetchWithTimeout,
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