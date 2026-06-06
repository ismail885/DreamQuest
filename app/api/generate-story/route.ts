import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseClient'
import { generateAdventure } from '@/lib/generator/engine'
import type { GeneratedNode } from '@/lib/generator/types'

// ─── Types ──────────────────────────────────────────────────────────────

interface GenreDetectionResult {
  genreMoteur: string
  genreBDD: string
  difficulty: string
  duree_estimee: number
  description: string
}

interface EmbranchementInsert {
  texte: string
  id_aventure: number
  choix1: string | null
  choix2: string | null
  choix1_lien: number | null
  choix2_lien: number | null
  choix1_consequences: { texte: string } | null
  choix2_consequences: { texte: string } | null
}

const TITRE_MAX_LENGTH = 100 // VARCHAR(100) en BDD

// ─── Nettoyage en cas d'échec partiel ───────────────────────────────────

async function cleanupAventure(
  supabase: ReturnType<typeof createAdminClient>,
  aventureId: number
): Promise<void> {
  // Supprimer les embranchements (CASCADE devrait suffire, mais on sécurise)
  await supabase.from('embranchement').delete().eq('id_aventure', aventureId)
  await supabase.from('aventure').delete().eq('id', aventureId)
}

// ─── Détection de genre depuis le titre ─────────────────────────────────

function normalizeTitle(titre: string): string {
  return titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const KEYWORDS: Record<string, string[]> = {
  horreur: [
    'manoir', 'spectre', 'fantome', 'maudit', 'hante', 'sombre', 'ombre',
    'crypte', 'mort', 'sang', 'tenebres', 'chair', 'os', 'crane',
    'sorciere', 'demon', 'malediction', 'necro',
  ],
  fantaisy: [
    'foret', 'druide', 'elfe', 'nain', 'dragon', 'roi', 'chateau', 'mage',
    'epee', 'quete', 'anciens', 'rune', 'cristal', 'paladin', 'chevalier',
    'magie', 'royaume',
  ],
  mystere: [
    'enigme', 'mystere', 'secret', 'relique', 'codex', 'prophetie',
    'oracle', 'symbole', 'code', 'ancien', 'fragment',
  ],
  aventure: [
    'mine', 'tresor', 'expedition', 'temple', 'jungle', 'ruine', 'voyage',
    'carte', 'pirate', 'ile', 'exploration',
  ],
  "science-fiction": [
    'vaisseau', 'alien', 'mars', 'espace', 'station', 'robot', 'ia',
    'federation', 'galaxie', 'planete', 'orbite', 'nebuleuse', 'quantique',
    'cyborg', 'laser', 'fusion', 'colonie', 'cosmique', 'technologie',
    'satellite', 'sonde', 'compte a rebours', 'signal', 'extraterrestre',
    'station spatiale', 'vaisseau spatial', 'trou de ver',
  ],
  pirate: [
    'pirate', 'tresor', 'bateau', 'mer', 'occan', 'flibuste', 'galion',
    'ile', 'rhum', 'carte au tresor', 'abordage', 'voile', 'sirène',
    'kraken', 'coffre', 'or', 'canon', 'corsaire',
  ],
  cyberpunk: [
    'cyberpunk', 'hack', 'neon', 'implant', 'cyborg', 'mega', 'corporation',
    'bassefonds', 'reseau', 'technologie', 'puce', 'cybernetique', 'ia',
    'artificiel', 'conscience', 'nuit', 'bmn',
  ],
  mythologique: [
    'mythologie', 'dieux', 'olympe', 'heros', 'divin', 'titan', 'thor',
    'odin', 'zeus', 'hadès', 'enfer', 'nordique', 'grec', 'egyptien',
    'mythe', 'légende', 'epopee', 'valhalla', 'asgard', 'atlantide',
    'minotaure', 'hydre', 'cerbere',
  ],
  western: [
    'western', 'farwest', 'cowboy', 'desert', 'saloon', 'diligence',
    'shérif', 'revolver', 'duel', 'caravane', 'poussiere', 'chevaux',
    'bandit', 'bétail', 'ranch', 'prix', 'indien', 'apache',
  ],
}

const DESCRIPTION_TEMPLATES: Record<string, string> = {
  horreur:
    '${titre} — là où les vivants ne s\'aventurent plus. Une obscurité ancienne attend ceux qui osent franchir le seuil.',
  fantaisy:
    '${titre} — un lieu chargé de magie et de dangers oubliés. Seuls les plus courageux y trouveront gloire ou trépas.',
  aventure:
    '${titre} — les rumeurs parlent de richesses cachées et de pièges mortels. À toi de découvrir la vérité.',
  mystere:
    '${titre} — des secrets millénaires enfermés dans la pierre. Chaque réponse soulève une nouvelle question.',
  "science-fiction":
    '${titre} — un voyage au-delà des étoiles. La technologie et l\'inconnu vous attendent dans les confins de l\'univers.',
  pirate:
    '${titre} — hissez les voiles ! Une aventure de pirates pleine de trésors, de batailles navales et de trahisons vous attend.',
  cyberpunk:
    '${titre} — plongez dans les bas-fonds d\'un futur dystopique où néons, implants et mégacorporations règnent en maîtres.',
  mythologique:
    '${titre} — une épopée antique où les dieux marchent parmi les mortels et où votre destinée dépasse l\'imagination.',
  western:
    '${titre} — au cœur du Far West, la poussière, la poudre et la justice se rencontrent au bout du revolver.',
}

const GENRE_CONFIG: Record<string, Omit<GenreDetectionResult, 'description'>> = {
  horreur: {
    genreMoteur: 'horror',
    genreBDD: 'horreur',
    difficulty: 'difficile',
    duree_estimee: 25,
  },
  fantaisy: {
    genreMoteur: 'fantasy',
    genreBDD: 'fantaisy',
    difficulty: 'normal',
    duree_estimee: 20,
  },
  mystere: {
    genreMoteur: 'horror',
    genreBDD: 'mystere',
    difficulty: 'difficile',
    duree_estimee: 30,
  },
  aventure: {
    genreMoteur: 'fantasy',
    genreBDD: 'aventure',
    difficulty: 'facile',
    duree_estimee: 15,
  },
  "science-fiction": {
    genreMoteur: 'scifi',
    genreBDD: 'science-fiction',
    difficulty: 'normal',
    duree_estimee: 25,
  },
  pirate: {
    genreMoteur: 'pirate',
    genreBDD: 'aventure',
    difficulty: 'normal',
    duree_estimee: 20,
  },
  cyberpunk: {
    genreMoteur: 'cyberpunk',
    genreBDD: 'science-fiction',
    difficulty: 'difficile',
    duree_estimee: 30,
  },
  mythologique: {
    genreMoteur: 'mythologique',
    genreBDD: 'fantaisy',
    difficulty: 'normal',
    duree_estimee: 25,
  },
  western: {
    genreMoteur: 'western',
    genreBDD: 'aventure',
    difficulty: 'facile',
    duree_estimee: 15,
  },
}

function detectGenreFromTitle(titre: string): GenreDetectionResult {
  const normalized = normalizeTitle(titre)

  for (const [genre, keywords] of Object.entries(KEYWORDS)) {
    const found = keywords.some((kw) => normalized.includes(kw))
    if (found) {
      const config = GENRE_CONFIG[genre]
      const template = DESCRIPTION_TEMPLATES[genre]
      return {
        ...config,
        description: template.replace('${titre}', titre),
      }
    }
  }

  // Fallback : fantasy par défaut
  return {
    genreMoteur: 'fantasy',
    genreBDD: 'fantaisy',
    difficulty: 'normal',
    duree_estimee: 20,
    description: `${titre} — un lieu chargé de magie et de dangers oubliés. Seuls les plus courageux y trouveront gloire ou trépas.`,
  }
}

// ─── Résolution des liens GeneratedNode → node.id ───────────────────────
// Le moteur utilise des liens "node_X_Y" (noeud X, choix Y)
// mais les IDs réels sont "node_X", "ending_X", "root".
// Cette fonction extrait l'ID du noeud cible depuis le lien.

function resolveLinkToNodeId(link: string): string {
  // "node_3_1" → "node_3"
  const nodeMatch = link.match(/^node_(\d+)_\d+$/)
  if (nodeMatch) return `node_${nodeMatch[1]}`
  // "ending_0" → "ending_0" (pas de transformation)
  return link
}

// ─── Mapping GeneratedNode → format embranchement BDD ───────────────────

function nodeToEmbranchement(
  node: GeneratedNode,
  aventureId: number
): EmbranchementInsert {
  const isEnd = node.isEnd === true
  const choix1 = isEnd ? null : node.choices[0]?.text ?? null
  const choix2 = isEnd ? null : node.choices[1]?.text ?? null

  const choix1_consequences =
    !isEnd && node.choices[0]?.consequences
      ? { texte: node.choices[0].consequences }
      : null

  const choix2_consequences =
    !isEnd && node.choices[1]?.consequences
      ? { texte: node.choices[1].consequences }
      : null

  return {
    texte: node.text,
    id_aventure: aventureId,
    choix1,
    choix2,
    choix1_lien: null,
    choix2_lien: null,
    choix1_consequences,
    choix2_consequences,
  }
}

// ─── Réponse d'erreur standardisée ──────────────────────────────────────

function errorResponse(message: string, status: number, details?: string) {
  const body: Record<string, unknown> = { error: message }
  if (details !== undefined) body.details = details
  return NextResponse.json(body, { status })
}

// ─── Route POST ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Parsing et validation de la requête
    let body: Record<string, unknown>
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      return errorResponse('Le titre est requis', 400)
    }

    const titreRaw = body.titre

    if (
      titreRaw === undefined ||
      titreRaw === null ||
      typeof titreRaw !== 'string' ||
      titreRaw.trim() === ''
    ) {
      return errorResponse('Le titre est requis', 400)
    }

    const titre = titreRaw.trim()

    // Validation longueur (VARCHAR(100) en BDD)
    if (titre.length > TITRE_MAX_LENGTH) {
      return errorResponse(
        `Le titre ne doit pas dépasser ${TITRE_MAX_LENGTH} caractères`,
        400
      )
    }

    // Validation auteur_id : nombre entier positif uniquement
    const auteur_idRaw = body.auteur_id
    let auteur_id: number | null = null
    if (auteur_idRaw !== undefined && auteur_idRaw !== null) {
      if (
        typeof auteur_idRaw !== 'number' ||
        !Number.isInteger(auteur_idRaw) ||
        auteur_idRaw < 1
      ) {
        return errorResponse('auteur_id doit être un entier positif', 400)
      }
      auteur_id = auteur_idRaw
    }

    // 2. Détection du genre
    let genreInfo: GenreDetectionResult
    try {
      genreInfo = detectGenreFromTitle(titre)
    } catch {
      // Fallback en cas d'erreur de détection
      genreInfo = {
        genreMoteur: 'romance',
        genreBDD: 'aventure',
        difficulty: 'normal',
        duree_estimee: 20,
        description: `${titre} — les rumeurs parlent de richesses cachées et de pièges mortels. À toi de découvrir la vérité.`,
      }
    }

    const { genreMoteur, genreBDD, difficulty, duree_estimee, description } =
      genreInfo

    // 3. Génération des nœuds via le moteur
    const generated = generateAdventure({ title: titre, genre: genreMoteur })
    const nodes = generated.nodes

    if (nodes.length === 0) {
      return errorResponse(
        'Erreur lors de la génération',
        500,
        'Le moteur n\'a généré aucun nœud'
      )
    }

    // 4. Insertion Supabase en 4 étapes
    const supabase = createAdminClient()

    // ÉTAPE 1 : INSERT aventure avec embranchement_initial_id = NULL
    const { data: aventure, error: errAventure } = await supabase
      .from('aventure')
      .insert({
        titre,
        description,
        auteur_id,
        embranchement_initial_id: null,
        difficulty,
        genre: genreBDD,
        duree_estimee,
        popularite: 0,
        consequences: null,
      })
      .select()
      .single()

    if (errAventure || !aventure) {
      console.error('Erreur insertion aventure:', errAventure)
      return errorResponse(
        'Erreur lors de la génération',
        500,
        errAventure?.message ?? 'Aventure non créée'
      )
    }

    const aventureId: number = aventure.id

    // ÉTAPE 2 : Batch INSERT de tous les embranchements en une seule requête
    const branchesData = nodes.map((node) => nodeToEmbranchement(node, aventureId))
    const { data: insertedBranches, error: errBatch } = await supabase
      .from('embranchement')
      .insert(branchesData)
      .select('id')

    if (errBatch || !insertedBranches || insertedBranches.length !== nodes.length) {
      console.error('Erreur batch insertion embranchements:', errBatch)
      await cleanupAventure(supabase, aventureId)
      return errorResponse(
        'Erreur lors de la génération',
        500,
        errBatch?.message ?? 'Embranchements non créés'
      )
    }

    // L'ordre de retour du batch insert correspond à l'ordre d'insertion
    const nodeToDbId = new Map<string, number>()
    nodes.forEach((node, index) => {
      nodeToDbId.set(node.id, insertedBranches[index].id)
    })

    // ÉTAPE 3 : UPDATE embranchements en parallèle pour renseigner choix1_lien et choix2_lien
    const updatePromises: Promise<{ error: unknown }>[] = []

    for (const node of nodes) {
      const dbId = nodeToDbId.get(node.id)
      if (dbId === undefined) continue

      if (node.isEnd === true) continue // Pas de liens pour les fins

      const choix1Link = node.choices[0]?.link ?? null
      const choix2Link = node.choices[1]?.link ?? null

      // Résoudre les liens vers les IDs DB réels
      const choix1_lien = choix1Link
        ? nodeToDbId.get(resolveLinkToNodeId(choix1Link)) ?? null
        : null
      const choix2_lien = choix2Link
        ? nodeToDbId.get(resolveLinkToNodeId(choix2Link)) ?? null
        : null

      // Ne faire l'UPDATE que si au moins un lien existe
      if (choix1_lien !== null || choix2_lien !== null) {
        updatePromises.push(
          supabase
            .from('embranchement')
            .update({ choix1_lien, choix2_lien })
            .eq('id', dbId) as unknown as Promise<{ error: unknown }>
        )
      }
    }

    const updateResults = await Promise.all(updatePromises)
    const updateErrors = updateResults
      .map((r, i) => (r.error ? `embranchement ${i}: ${r.error}` : null))
      .filter(Boolean) as string[]

    // Si des UPDATEs ont échoué, on rollback tout
    if (updateErrors.length > 0) {
      console.error('Échec des UPDATEs de liens, rollback en cours...', updateErrors)
      await cleanupAventure(supabase, aventureId)
      return errorResponse(
        'Erreur lors de la génération',
        500,
        `Impossible de lier les embranchements: ${updateErrors.join(', ')}`
      )
    }

    // ÉTAPE 4 : UPDATE aventure pour renseigner embranchement_initial_id
    const rootDbId = nodeToDbId.get('root')
    if (rootDbId === undefined) {
      // Cas théoriquement impossible (le moteur crée toujours un node 'root')
      await cleanupAventure(supabase, aventureId)
      return errorResponse(
        'Erreur lors de la génération',
        500,
        'Noeud racine introuvable'
      )
    }

    const { error: errUpdateAventure } = await supabase
      .from('aventure')
      .update({ embranchement_initial_id: rootDbId })
      .eq('id', aventureId)

    if (errUpdateAventure) {
      console.error(
        'Erreur UPDATE aventure.embranchement_initial_id:',
        errUpdateAventure
      )
      await cleanupAventure(supabase, aventureId)
      return errorResponse(
        'Erreur lors de la génération',
        500,
        errUpdateAventure.message
      )
    }

    // 5. Réponse succès
    return NextResponse.json({
      success: true,
      aventure_id: aventureId,
      titre,
      genre: genreBDD,
      difficulty,
      nb_embranchements: nodes.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('Erreur generate-story:', error)
    return errorResponse('Erreur lors de la génération', 500, message)
  }
}
