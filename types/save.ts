// Types pour sauvegardes (MongoDB)

export interface Save {
  _id: string // MongoDB ObjectId
  id_utilisateur: number // ID Supabase
  id_aventure: string // MongoDB ObjectId
  id_personnage: number // ID Supabase
  id_embranchement_actuel: string // MongoDB ObjectId
  date_sauvegarde: Date | string
  progression: number
}

export interface SaveWithDetails extends Save {
  aventure_titre?: string
  personnage_nom?: string
}
