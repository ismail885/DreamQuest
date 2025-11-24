export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

import { supabase } from './supabaseClient'
import { connectDB, Aventure, Sauvegarde } from './mongodb'
import type { AdventureWithAuthor } from '@/types/adventure'
import type { SaveWithDetails } from '@/types/save'
import type { Types } from 'mongoose'

interface AventureDoc {
  _id: Types.ObjectId
  titre: string
  description: string
  auteur_id: number
  date_creation: Date
  popularite: number
  embranchement_initial?: Types.ObjectId
}

interface SaveDoc {
  _id: Types.ObjectId
  id_utilisateur: number
  id_aventure: { _id: Types.ObjectId; titre: string }
  id_personnage: number
  id_embranchement_actuel: Types.ObjectId
  date_sauvegarde: Date
  progression: number
}

export async function getAdventureWithAuthor(adventureId: string): Promise<AdventureWithAuthor | null> {
  try {
    await connectDB()
    
    const adventure = await Aventure.findById(adventureId).lean() as AventureDoc | null
    if (!adventure) return null

    const { data: author } = await supabase
      .from('utilisateur')
      .select('nom_utilisateur')
      .eq('id_utilisateur', adventure.auteur_id)
      .single()

    return {
      _id: adventure._id.toString(),
      titre: adventure.titre,
      description: adventure.description,
      auteur_id: adventure.auteur_id,
      date_creation: adventure.date_creation,
      popularite: adventure.popularite,
      embranchement_initial: adventure.embranchement_initial?.toString(),
      auteur_nom: author?.nom_utilisateur
    }
  } catch (error) {
    console.error('Erreur getAdventureWithAuthor:', error)
    return null
  }
}

export async function getAllAdventuresWithAuthors(): Promise<AdventureWithAuthor[]> {
  try {
    await connectDB()
    
    const adventures = await Aventure.find().sort({ date_creation: -1 }).lean() as unknown as AventureDoc[]
    
    const authorIds = [...new Set(adventures.map(a => a.auteur_id))]
    const { data: authors } = await supabase
      .from('utilisateur')
      .select('id_utilisateur, nom_utilisateur')
      .in('id_utilisateur', authorIds)

    const authorMap = new Map(authors?.map(a => [a.id_utilisateur, a.nom_utilisateur]) || [])

    return adventures.map(adventure => ({
      _id: adventure._id.toString(),
      titre: adventure.titre,
      description: adventure.description,
      auteur_id: adventure.auteur_id,
      date_creation: adventure.date_creation,
      popularite: adventure.popularite,
      embranchement_initial: adventure.embranchement_initial?.toString(),
      auteur_nom: authorMap.get(adventure.auteur_id)
    }))
  } catch (error) {
    console.error('Erreur getAllAdventuresWithAuthors:', error)
    return []
  }
}

export async function getUserSavesWithDetails(userId: number): Promise<SaveWithDetails[]> {
  try {
    await connectDB()
    
    const saves = await Sauvegarde.find({ id_utilisateur: userId })
      .populate('id_aventure')
      .sort({ date_sauvegarde: -1 })
      .lean() as unknown as SaveDoc[]

    const characterIds = [...new Set(saves.map(s => s.id_personnage))]
    const { data: characters } = await supabase
      .from('personnage')
      .select('id_personnage, nom_personnage')
      .in('id_personnage', characterIds)

    const characterMap = new Map(characters?.map(c => [c.id_personnage, c.nom_personnage]) || [])

    return saves.map(save => ({
      _id: save._id.toString(),
      id_utilisateur: save.id_utilisateur,
      id_aventure: save.id_aventure._id.toString(),
      id_personnage: save.id_personnage,
      id_embranchement_actuel: save.id_embranchement_actuel.toString(),
      date_sauvegarde: save.date_sauvegarde,
      progression: save.progression,
      aventure_titre: save.id_aventure.titre,
      personnage_nom: characterMap.get(save.id_personnage)
    }))
  } catch (error) {
    console.error('Erreur getUserSavesWithDetails:', error)
    return []
  }
}

export async function voteForAdventure(userId: number, adventureId: string): Promise<boolean> {
  try {
    const { data: existingVote } = await supabase
      .from('vote')
      .select('id_vote')
      .eq('id_utilisateur', userId)
      .eq('id_aventure', adventureId)
      .single()

    if (existingVote) {
      console.log('Utilisateur a déjà voté pour cette aventure')
      return false
    }

    const { error: voteError } = await supabase
      .from('vote')
      .insert({ id_utilisateur: userId, id_aventure: adventureId })

    if (voteError) throw voteError

    await connectDB()
    await Aventure.findByIdAndUpdate(adventureId, { $inc: { popularite: 1 } })

    return true
  } catch (error) {
    console.error('Erreur voteForAdventure:', error)
    return false
  }
}

export async function getTopAdventures(limit: number = 10): Promise<AdventureWithAuthor[]> {
  try {
    await connectDB()
    
    const adventures = await Aventure.find()
      .sort({ popularite: -1 })
      .limit(limit)
      .lean() as unknown as AventureDoc[]

    const authorIds = [...new Set(adventures.map(a => a.auteur_id))]
    const { data: authors } = await supabase
      .from('utilisateur')
      .select('id_utilisateur, nom_utilisateur')
      .in('id_utilisateur', authorIds)

    const authorMap = new Map(authors?.map(a => [a.id_utilisateur, a.nom_utilisateur]) || [])

    return adventures.map(adventure => ({
      _id: adventure._id.toString(),
      titre: adventure.titre,
      description: adventure.description,
      auteur_id: adventure.auteur_id,
      date_creation: adventure.date_creation,
      popularite: adventure.popularite,
      embranchement_initial: adventure.embranchement_initial?.toString(),
      auteur_nom: authorMap.get(adventure.auteur_id)
    }))
  } catch (error) {
    console.error('Erreur getTopAdventures:', error)
    return []
  }
}
