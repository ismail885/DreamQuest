// Types pour aventures (MongoDB)

export interface Adventure {
  _id: string // MongoDB ObjectId
  titre: string
  description: string
  auteur_id: number // ID Supabase
  date_creation: Date | string
  popularite: number
  embranchement_initial?: string // MongoDB ObjectId
}

export interface Branch {
  _id: string // MongoDB ObjectId
  texte: string
  choix1: string
  choix1_lien: string | null // MongoDB ObjectId
  choix2: string
  choix2_lien: string | null // MongoDB ObjectId
  id_aventure: string // MongoDB ObjectId
}

export interface AdventureWithAuthor extends Adventure {
  auteur_nom?: string // Jointure avec Supabase
}
