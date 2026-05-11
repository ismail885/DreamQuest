export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

import { supabase, Aventure, Sauvegarde } from './supabaseClient'
import type { AdventureWithAuthor } from '@/types/adventure'
import type { SaveWithDetails } from '@/types/save'

interface AventureWithUtilisateur extends Aventure {
  utilisateur: { nom_utilisateur: string } | null
}

interface SauvegardeWithRelations extends Sauvegarde {
  aventure: { titre: string } | null
  personnage: { nom_personnage: string } | null
}

/**
 * Recupere une aventure avec les informations de l'auteur
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
      auteur_nom: adventure.utilisateur?.nom_utilisateur
    }
  } catch {
    return null
  }
}

/**
 * Recupere toutes les aventures avec les informations des auteurs
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
      auteur_nom: adventure.utilisateur?.nom_utilisateur
    }))
  } catch {
    return []
  }
}

/**
 * Recupere les sauvegardes d'un utilisateur avec les details
 */
export async function getUserSavesWithDetails(userId: number): Promise<SaveWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('sauvegarde')
      .select(`*, aventure:id_aventure (titre), personnage:id_personnage (nom_personnage)`)
      .eq('id_utilisateur', userId)
      .order('date_sauvegarde', { ascending: false })

    if (error || !data) return []

    const saves = data as SauvegardeWithRelations[]

    return saves.map(save => ({
      id: save.id,
      id_utilisateur: save.id_utilisateur,
      id_aventure: save.id_aventure,
      id_personnage: save.id_personnage,
      id_embranchement_actuel: save.id_embranchement_actuel,
      progression: save.progression,
      date_sauvegarde: save.date_sauvegarde,
      aventure_titre: save.aventure?.titre,
      personnage_nom: save.personnage?.nom_personnage
    }))
  } catch {
    return []
  }
}

/**
 * Vote pour une aventure (un utilisateur ne peut voter qu'une fois par aventure)
 */
export async function voteForAdventure(userId: number, adventureId: number): Promise<boolean> {
  try {
    const { data: existingVote } = await supabase
      .from('vote')
      .select('id')
      .eq('id_utilisateur', userId)
      .eq('id_aventure', adventureId)
      .single()

    if (existingVote) {
      return false
    }

    const { error: voteError } = await supabase
      .from('vote')
      .insert({ id_utilisateur: userId, id_aventure: adventureId })

    if (voteError) throw voteError

    const { data: currentAdventure } = await supabase
      .from('aventure')
      .select('popularite')
      .eq('id', adventureId)
      .single()

    if (currentAdventure) {
      await supabase
        .from('aventure')
        .update({ popularite: (currentAdventure as { popularite: number }).popularite + 1 })
        .eq('id', adventureId)
    }

    return true
  } catch {
    return false
  }
}

/**
 * Recupere les aventures les plus populaires
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
      auteur_nom: adventure.utilisateur?.nom_utilisateur
    }))
  } catch {
    return []
  }
}

/**
 * Recupere un embranchement par son ID
 */
export async function getBranchById(branchId: number) {
  try {
    const { data, error } = await supabase
      .from('embranchement')
      .select('id,texte,choix1,choix1_lien,choix1_consequences,choix2,choix2_lien,choix2_consequences,id_aventure')
      .eq('id', branchId)
      .single();

if (error) throw error
    return data
  } catch {
    return null
  }
}

/**
 * Cree ou met a jour une sauvegarde
 */
export async function saveProgress(
  userId: number,
  adventureId: number,
  characterId: number,
  currentBranchId: number,
  progression: number
): Promise<boolean> {
  try {
    const { data: existingSave } = await supabase
      .from('sauvegarde')
      .select('id')
      .eq('id_utilisateur', userId)
      .eq('id_aventure', adventureId)
      .eq('id_personnage', characterId)
      .single()

    if (existingSave) {
      const { error } = await supabase
        .from('sauvegarde')
        .update({
          id_embranchement_actuel: currentBranchId,
          progression: progression
        })
        .eq('id', (existingSave as { id: number }).id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('sauvegarde')
        .insert({
          id_utilisateur: userId,
          id_aventure: adventureId,
          id_personnage: characterId,
          id_embranchement_actuel: currentBranchId,
          progression: progression
        })

      if (error) throw error
    }

    return true
  } catch {
    return false
  }
}
