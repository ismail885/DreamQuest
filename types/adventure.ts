export interface Adventure {
  id: number
  titre: string
  description: string | null
  auteur_id: number | null
  date_creation: string
  popularite: number
  embranchement_initial_id?: number | null
}

export interface Branch {
  id: number
  texte: string
  choix1: string
  choix1_lien: number | null
  choix1_consequences: string | null
  choix2: string
  choix2_lien: number | null
  choix2_consequences: string | null
  id_aventure: number
}

export interface ConsequenceEffect {
  pv?: number
  force?: number
  agility?: number
  magie?: number
  endurance?: number
  text?: string
  pv_change?: number
  force_change?: number
  agility_change?: number
  magie_change?: number
  endurance_change?: number
}

export interface StatChange {
  force?: number;
  agility?: number;
  magie?: number;
  endurance?: number;
}

export interface AdventureWithAuthor extends Adventure {
  auteur_nom?: string
  embranchement_initial_id?: number | null
}

export interface UserCreation {
  id: number
  titre: string
  popularite: number
}

export interface AdventureListItem {
  id: number
  titre: string
  description: string | null
  popularite: number
  difficulte?: 'facile' | 'normal' | 'difficile'
  duree?: 'courte' | 'moyenne' | 'longue'
  genre?: string
}
