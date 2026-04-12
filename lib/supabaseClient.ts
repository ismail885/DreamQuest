import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'joueur' | 'createur'

export interface Utilisateur {
  id: number
  nom_utilisateur: string
  email: string
  mot_de_passe: string
  date_creation: string
  role: UserRole
  auth_id?: string | null
}

export interface Personnage {
  id: number
  nom_personnage: string
  classe: string
  niveau: number
  points_vie: number
  id_utilisateur: number
}

export interface Aventure {
  id: number
  titre: string
  description: string | null
  auteur_id: number | null
  date_creation: string
  popularite: number
  embranchement_initial_id: number | null
}

export interface Embranchement {
  id: number
  texte: string
  choix1: string
  choix1_lien: number | null
  choix2: string
  choix2_lien: number | null
  id_aventure: number
  // Conséquences par choix (stockées en JSON dans la DB)
  choix1_consequences?: string | null
  choix2_consequences?: string | null
}

export interface Sauvegarde {
  id: number
  id_utilisateur: number
  id_aventure: number
  id_personnage: number
  id_embranchement_actuel: number | null
  progression: number
  date_sauvegarde: string
}

export interface Vote {
  id: number
  id_utilisateur: number
  id_aventure: number
  date_vote: string
}

