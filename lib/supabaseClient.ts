import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Variables Supabase manquantes dans .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



export type Database = {
  public: {
    Tables: {
      utilisateur: {
        Row: {
          id_utilisateur: number
          nom_utilisateur: string
          email: string
          mot_de_passe: string
          date_creation: string
          role: string
        }
        Insert: {
          nom_utilisateur: string
          email: string
          mot_de_passe: string
          role?: string
        }
        Update: {
          nom_utilisateur?: string
          email?: string
          mot_de_passe?: string
          role?: string
        }
      }
      personnage: {
        Row: {
          id_personnage: number
          nom_personnage: string
          classe: string
          niveau: number
          points_vie: number
          id_utilisateur: number
        }
        Insert: {
          nom_personnage: string
          classe: string
          niveau?: number
          points_vie?: number
          id_utilisateur: number
        }
        Update: {
          nom_personnage?: string
          classe?: string
          niveau?: number
          points_vie?: number
        }
      }
      vote: {
        Row: {
          id_vote: number
          id_utilisateur: number
          id_aventure: string // ID MongoDB
          date_vote: string
        }
        Insert: {
          id_utilisateur: number
          id_aventure: string
        }
        Update: {
          id_aventure?: string
        }
      }
    }
  }
}

