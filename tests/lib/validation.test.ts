import {
  adventureSchema,
  createAdventureSchema,
  createCharacterSchema,
  parseAdventure,
} from "@/lib/validation/schemas";

describe("Validation (Zod) - schemas de donnees", () => {
  describe("adventureSchema", () => {
    it("valide une aventure correcte", () => {
      const ok = adventureSchema.safeParse({
        id: 1,
        titre: "Le Chateau Hante",
        description: "Une aventure",
        auteur_id: 5,
        date_creation: "2026-01-01",
        popularite: 10,
        embranchement_initial_id: 3,
      });
      expect(ok.success).toBe(true);
    });

    it("accepte les champs nullables (description, auteur_id)", () => {
      const ok = adventureSchema.safeParse({
        id: 2,
        titre: "Aventure minimale",
        description: null,
        auteur_id: null,
        date_creation: "2026-01-01",
        popularite: 0,
      });
      expect(ok.success).toBe(true);
    });

    it("rejette un titre vide", () => {
      const r = adventureSchema.safeParse({
        id: 1, titre: "", description: null, auteur_id: null,
        date_creation: "2026-01-01", popularite: 0,
      });
      expect(r.success).toBe(false);
    });

    it("rejette un mauvais type (popularite en texte)", () => {
      const r = adventureSchema.safeParse({
        id: 1, titre: "X", description: null, auteur_id: null,
        date_creation: "2026-01-01", popularite: "beaucoup",
      });
      expect(r.success).toBe(false);
    });

    it("rejette un id manquant", () => {
      const r = adventureSchema.safeParse({
        titre: "Sans id", description: null, auteur_id: null,
        date_creation: "2026-01-01", popularite: 0,
      });
      expect(r.success).toBe(false);
    });

    it("parseAdventure renvoie success=false sur entree invalide", () => {
      expect(parseAdventure({}).success).toBe(false);
      expect(parseAdventure(null).success).toBe(false);
    });
  });

  describe("createAdventureSchema", () => {
    it("valide une saisie correcte", () => {
      const r = createAdventureSchema.safeParse({
        titre: "Ma nouvelle aventure",
        description: "desc",
        genre: "fantasy",
        difficulte: "normal",
      });
      expect(r.success).toBe(true);
    });

    it("rejette un titre trop court (< 3 caracteres)", () => {
      const r = createAdventureSchema.safeParse({
        titre: "ab", genre: "fantasy", difficulte: "normal",
      });
      expect(r.success).toBe(false);
    });

    it("rejette une difficulte inconnue", () => {
      const r = createAdventureSchema.safeParse({
        titre: "Titre valide", genre: "fantasy", difficulte: "impossible",
      });
      expect(r.success).toBe(false);
    });

    it("rejette un genre vide", () => {
      const r = createAdventureSchema.safeParse({
        titre: "Titre valide", genre: "", difficulte: "facile",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("createCharacterSchema", () => {
    it("valide une creation correcte", () => {
      const r = createCharacterSchema.safeParse({
        nom_personnage: "Aragorn",
        classe: "Guerrier",
        id_utilisateur: 1,
      });
      expect(r.success).toBe(true);
    });

    it("rejette un nom trop court", () => {
      const r = createCharacterSchema.safeParse({
        nom_personnage: "A", classe: "Mage", id_utilisateur: 1,
      });
      expect(r.success).toBe(false);
    });

    it("rejette un id_utilisateur negatif", () => {
      const r = createCharacterSchema.safeParse({
        nom_personnage: "Gandalf", classe: "Mage", id_utilisateur: -1,
      });
      expect(r.success).toBe(false);
    });
  });
});
