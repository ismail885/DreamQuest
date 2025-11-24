// Types pour histoires et embranchements (MongoDB)

export interface StoryNode {
  _id: string
  texte: string
  choix1: string
  choix1_lien: string | null
  choix2: string
  choix2_lien: string | null
  id_aventure: string
}

export interface StoryChoice {
  texte: string
  lien: string | null
}

export interface StoryWithChoices {
  node: StoryNode
  choices: StoryChoice[]
}
