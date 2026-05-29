export type UserRole = 'admin' | 'joueur' | 'createur'

export interface User {
  id: number
  nom_utilisateur: string
  email: string
  mot_de_passe?: string 
  date_creation: string
  role: UserRole
}

export interface UserProfile {
  id: number
  nom_utilisateur: string
  email: string
  date_creation: string
  role: UserRole
}

export interface ExtendedUserProfile extends UserProfile {
  niveau: number
  experience: number
  saison_actuelle: number
  meilleur_niveau: number
}

export interface UserStats {
  storiesPlayed: number
  storiesCreated: number
  likes: number
  trophies: number
}

export interface Vote {
  id: number
  id_utilisateur: number
  id_aventure: number
  date_vote: string
}

// Fonctions utilitaires pour verifier les permissions
export function canCreateStory(role: UserRole): boolean {
  return role === 'createur' || role === 'admin'
}

export function canPlayGame(role: UserRole): boolean {
  return role === 'joueur' || role === 'createur' || role === 'admin'
}

export function canCreateCharacter(role: UserRole): boolean {
  return role === 'joueur' || role === 'createur' || role === 'admin'
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}
