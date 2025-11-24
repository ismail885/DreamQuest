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

export interface Character {
  id_personnage: number
  nom_personnage: string
  classe: string
  niveau: number
  points_vie: number
  id_utilisateur: number
}

export interface Vote {
  id_vote: number
  id_utilisateur: number
  id_aventure: string // ID MongoDB
  date_vote: string
}
