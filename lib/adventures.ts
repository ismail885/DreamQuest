import { supabase } from './supabaseClient'
import type { AdventureWithAuthor, Adventure } from '@/types/adventure'

interface AventureWithUtilisateur extends Adventure {
  utilisateur: { nom_utilisateur: string } | null
}

/**
 * Récupère une aventure avec le nom de son auteur.
 */
export async function getAdventureWithAuthor(adventureId: number): Promise<AdventureWithAuthor | null> {
  try {
    const { data, error } = await supabase
      .from('aventure')
      .select(`*, utilisateur:auteur_id (nom_utilisateur)`)
      .eq('id', adventureId)
      .single()

    if (error || !data) return null

    const adventure = data as AventureWithUtilisateur

    return {
      id: adventure.id,
      titre: adventure.titre,
      description: adventure.description,
      auteur_id: adventure.auteur_id,
      date_creation: adventure.date_creation,
      popularite: adventure.popularite,
      auteur_nom: adventure.utilisateur?.nom_utilisateur,
    }
  } catch (err) {
    console.error('[adventures] getAdventureWithAuthor failed:', err, 'adventureId:', adventureId)
    return null
  }
}

/**
 * Récupère toutes les aventures avec leurs auteurs, triées par date de création.
 */
export async function getAllAdventuresWithAuthors(): Promise<AdventureWithAuthor[]> {
  try {
    const { data, error } = await supabase
      .from('aventure')
      .select(`*, utilisateur:auteur_id (nom_utilisateur)`)
      .order('date_creation', { ascending: false })

    if (error || !data) return []

    const adventures = data as AventureWithUtilisateur[]

    return adventures.map(adventure => ({
      id: adventure.id,
      titre: adventure.titre,
      description: adventure.description,
      auteur_id: adventure.auteur_id,
      date_creation: adventure.date_creation,
      popularite: adventure.popularite,
      auteur_nom: adventure.utilisateur?.nom_utilisateur,
    }))
  } catch (err) {
    console.error('[adventures] getAllAdventuresWithAuthors failed:', err)
    return []
  }
}

/**
 * Récupère les aventures les plus populaires.
 */
export async function getTopAdventures(limit: number = 10): Promise<AdventureWithAuthor[]> {
  try {
    const { data, error } = await supabase
      .from('aventure')
      .select(`*, utilisateur:auteur_id (nom_utilisateur)`)
      .order('popularite', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    const adventures = data as AventureWithUtilisateur[]

    return adventures.map(adventure => ({
      id: adventure.id,
      titre: adventure.titre,
      description: adventure.description,
      auteur_id: adventure.auteur_id,
      date_creation: adventure.date_creation,
      popularite: adventure.popularite,
      auteur_nom: adventure.utilisateur?.nom_utilisateur,
    }))
  } catch (err) {
    console.error('[adventures] getTopAdventures failed:', err, 'limit:', limit)
    return []
  }
}

/**
 * Récupère un embranchement (nœud narratif) par son ID.
 */
export async function getBranchById(branchId: number) {
  try {
    const { data, error } = await supabase
      .from('embranchement')
      .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
      .eq('id', branchId)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('[adventures] getBranchById failed:', err, 'branchId:', branchId)
    return null
  }
}
