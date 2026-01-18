export interface Adventure {
  id: number
  titre: string
  description: string | null
  auteur_id: number | null
  date_creation: string
  popularite: number
  embranchement_initial_id: number | null
}

export interface Branch {
  id: number
  texte: string
  choix1: string
  choix1_lien: number | null
  choix2: string
  choix2_lien: number | null
  id_aventure: number
}

export interface AdventureWithAuthor extends Adventure {
  auteur_nom?: string
}

export interface UserCreation {
  id: number
  titre: string
  popularite: number
}
