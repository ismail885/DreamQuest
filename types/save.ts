export interface Save {
  id: number
  id_utilisateur: number
  id_aventure: number
  id_personnage: number
  id_embranchement_actuel: number | null
  progression: number
  date_sauvegarde: string
}

export interface SaveWithDetails extends Save {
  aventure_titre?: string
  personnage_nom?: string
}

export interface UserSave {
  id: number
  id_utilisateur: number
  id_aventure: number
  id_personnage: number
  id_embranchement_actuel: number | null
  progression: number
  date_sauvegarde: string
  aventure_titre: string
  personnage_nom?: string
  personnage_classe?: string
  status: "completed" | "in-progress"
}
