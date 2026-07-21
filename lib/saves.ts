import { supabase } from './supabaseClient'
import type { Save } from '@/types/save'
import type { SaveWithDetails } from '@/types/save'

interface SauvegardeWithRelations extends Save {
  aventure: { titre: string } | null
  personnage: { nom_personnage: string } | null
}

/**
 * Récupère les sauvegardes d'un utilisateur avec les détails (titre aventure, nom personnage).
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
      personnage_nom: save.personnage?.nom_personnage,
    }))
  } catch (err) {
    console.error('[saves] getUserSavesWithDetails failed:', err, 'userId:', userId)
    return []
  }
}

/**
 * Sauvegarde ou met à jour la progression d'un joueur dans une aventure.
 */
export async function saveProgress(
  userId: number,
  adventureId: number,
  characterId: number,
  currentBranchId: number,
  progression: number,
): Promise<boolean> {
  try {
    const res = await fetch('/api/saves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adventureId,
        characterId,
        currentBranchId,
        progression,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de sauvegarde');
    return true;
  } catch (err) {
    console.error('[saves] saveProgress failed:', err, 'userId:', userId, 'adventureId:', adventureId)
    return false
  }
}
