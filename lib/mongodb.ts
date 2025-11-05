import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI manquant dans .env.local')
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
  }
}
