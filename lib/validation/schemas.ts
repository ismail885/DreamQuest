import { z } from "zod";

/**
 * Schemas de validation (Zod).
 * Servent a valider les donnees entrantes (formulaires, API) et les donnees
 * lues en base avant de les utiliser dans l'application.
 */

// Une aventure telle que stockee / retournee par la base
export const adventureSchema = z.object({
  id: z.number().int().positive(),
  titre: z.string().min(1),
  description: z.string().nullable(),
  auteur_id: z.number().int().nullable(),
  date_creation: z.string(),
  popularite: z.number().int().min(0),
  embranchement_initial_id: z.number().int().nullable().optional(),
});

// Validation du formulaire de creation d'une aventure
export const createAdventureSchema = z.object({
  titre: z.string().trim().min(3, "Le titre doit faire au moins 3 caracteres").max(120),
  description: z.string().max(2000).optional(),
  genre: z.string().min(1, "Le genre est obligatoire"),
  difficulte: z.enum(["facile", "normal", "difficile", "legendaire"]),
});

// Validation de la creation d'un personnage
export const createCharacterSchema = z.object({
  nom_personnage: z.string().trim().min(2, "Nom trop court").max(30, "Nom trop long"),
  classe: z.string().min(1, "La classe est obligatoire"),
  id_utilisateur: z.number().int().positive(),
});

export type AdventureInput = z.infer<typeof adventureSchema>;
export type CreateAdventureInput = z.infer<typeof createAdventureSchema>;
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

/** Valide une aventure venant de la base (resultat sur, sans exception). */
export function parseAdventure(raw: unknown) {
  return adventureSchema.safeParse(raw);
}
