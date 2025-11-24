import mongoose, { Schema, Document } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI manquant dans .env')
}

let isConnected = false

export async function connectDB() {
  if (isConnected) return

  try {
    await mongoose.connect(MONGODB_URI)
    isConnected = true
    console.log('✅ MongoDB connecté')
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB :', error)
    throw error
  }
}
export interface IEmbranchement extends Document {
  texte: string
  choix1: string
  choix1_lien: mongoose.Types.ObjectId | null
  choix2: string
  choix2_lien: mongoose.Types.ObjectId | null
  id_aventure: mongoose.Types.ObjectId
}

const EmbranchementSchema = new Schema<IEmbranchement>({
  texte: { type: String, required: true },
  choix1: { type: String, required: true },
  choix1_lien: { type: Schema.Types.ObjectId, ref: 'Embranchement', default: null },
  choix2: { type: String, required: true },
  choix2_lien: { type: Schema.Types.ObjectId, ref: 'Embranchement', default: null },
  id_aventure: { type: Schema.Types.ObjectId, ref: 'Aventure', required: true }
}, { timestamps: true })

export interface IAventure extends Document {
  titre: string
  description: string
  auteur_id: number // ID Supabase
  date_creation: Date
  popularite: number
  embranchement_initial?: mongoose.Types.ObjectId
}

const AventureSchema = new Schema<IAventure>({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  auteur_id: { type: Number, required: true }, // Lié à Supabase
  date_creation: { type: Date, default: Date.now },
  popularite: { type: Number, default: 0 },
  embranchement_initial: { type: Schema.Types.ObjectId, ref: 'Embranchement' }
}, { timestamps: true })

export interface ISauvegarde extends Document {
  id_utilisateur: number // ID Supabase
  id_aventure: mongoose.Types.ObjectId
  id_personnage: number // ID Supabase
  id_embranchement_actuel: mongoose.Types.ObjectId
  date_sauvegarde: Date
  progression: number
}

const SauvegardeSchema = new Schema<ISauvegarde>({
  id_utilisateur: { type: Number, required: true }, // Lié à Supabase
  id_aventure: { type: Schema.Types.ObjectId, ref: 'Aventure', required: true },
  id_personnage: { type: Number, required: true }, // Lié à Supabase
  id_embranchement_actuel: { type: Schema.Types.ObjectId, ref: 'Embranchement', required: true },
  date_sauvegarde: { type: Date, default: Date.now },
  progression: { type: Number, default: 0 }
}, { timestamps: true })

export const Aventure = mongoose.models.Aventure || mongoose.model<IAventure>('Aventure', AventureSchema)
export const Embranchement = mongoose.models.Embranchement || mongoose.model<IEmbranchement>('Embranchement', EmbranchementSchema)
export const Sauvegarde = mongoose.models.Sauvegarde || mongoose.model<ISauvegarde>('Sauvegarde', SauvegardeSchema)
