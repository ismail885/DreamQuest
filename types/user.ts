export interface User {
  id_utilisateur: number
  nom_utilisateur: string
  email: string
  mot_de_passe?: string 
  date_creation: string
  role: 'joueur' | 'admin'
}

export interface UserProfile {
  id_utilisateur: number
  nom_utilisateur: string
  email: string
  date_creation: string
  role: string
}

export interface Vote {
  id_vote: number
  id_utilisateur: number
  id_aventure: string // ID MongoDB
  date_vote: string
}
