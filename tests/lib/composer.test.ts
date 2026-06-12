import { composerAventure } from "@/lib/generator/composition/composer";
import type { GenreNom, Difficulte } from "@/lib/generator/composition/types";

describe("composerAventure — moteur de génération thème × genre × difficulté", () => {
  describe("détection de thème dans le titre", () => {
    it("détecte le thème via un mot-clé (château)", () => {
      const a = composerAventure({ titre: "Le Château Hanté", genre: "Horreur", difficulte: "normal" });
      expect(a.lieu).toBeTruthy();
      expect(typeof a.lieu).toBe("string");
    });

    it("fonctionne avec un titre sans mot-clé connu (thème générique)", () => {
      const a = composerAventure({ titre: "Zorblax", genre: "Fantasy", difficulte: "normal" });
      expect(a.embranchements).toHaveLength(3);
    });

    it("ignore les accents et la casse à la détection", () => {
      const a = composerAventure({ titre: "LA FÔRET MAUDITE", genre: "Fantasy", difficulte: "normal" });
      expect(a.embranchements).toHaveLength(3);
    });
  });

  describe("respect des entrées", () => {
    it("retourne le genre identique à l'entrée", () => {
      const genres: GenreNom[] = [
        "Science-Fiction", "Fantasy", "Horreur", "Policier", "Western",
        "Pirate", "Cyberpunk", "Mythologique", "Romance",
      ];
      for (const g of genres) {
        expect(composerAventure({ titre: "Test", genre: g, difficulte: "normal" }).genre).toBe(g);
      }
    });

    it("retourne la difficulté identique à l'entrée", () => {
      const diffs: Difficulte[] = ["facile", "normal", "difficile", "legendaire"];
      for (const d of diffs) {
        expect(composerAventure({ titre: "Test", genre: "Fantasy", difficulte: d }).difficulte).toBe(d);
      }
    });

    it("retombe sur Fantasy si le genre est invalide", () => {
      const a = composerAventure({ titre: "Test", genre: "Inexistant" as GenreNom, difficulte: "normal" });
      expect(a.genre).toBe("Fantasy");
    });

    it("retombe sur normal si la difficulté est invalide", () => {
      const a = composerAventure({ titre: "Test", genre: "Fantasy", difficulte: "ultra" as Difficulte });
      expect(a.difficulte).toBe("normal");
    });
  });

  describe("structure de l'aventure", () => {
    it("produit exactement 3 embranchements de 2 choix chacun", () => {
      const a = composerAventure({ titre: "Le Donjon", genre: "Fantasy", difficulte: "difficile" });
      expect(a.embranchements).toHaveLength(3);
      a.embranchements.forEach((e, i) => {
        expect(e.id).toBe(i + 1);
        expect(e.choix).toHaveLength(2);
        expect(e.texte.length).toBeGreaterThan(0);
        e.choix.forEach((c) => {
          expect(c.libelle.length).toBeGreaterThan(0);
          expect(c.consequence.texte.length).toBeGreaterThan(0);
        });
      });
    });

    it("retourne exactement 3 tags", () => {
      const a = composerAventure({ titre: "Test", genre: "Cyberpunk", difficulte: "normal" });
      expect(a.tags).toHaveLength(3);
    });

    it("produit une description et un titre non vides", () => {
      const a = composerAventure({ titre: "Test", genre: "Pirate", difficulte: "facile" });
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.titre.length).toBeGreaterThan(0);
    });

    it("ne laisse aucun placeholder non remplacé", () => {
      const a = composerAventure({ titre: "La Crypte", genre: "Horreur", difficulte: "legendaire" });
      const tout = JSON.stringify(a);
      expect(tout).not.toMatch(/\{lieu\}|\{decor\}|\{antagoniste\}|\{titre\}|\{lieuHabille\}/);
    });
  });

  describe("enrichissement du titre", () => {
    it("enrichit un titre de moins de 4 mots avec le lieu", () => {
      const a = composerAventure({ titre: "Le Temple", genre: "Mythologique", difficulte: "normal" });
      expect(a.titre).toContain("—");
    });

    it("ne modifie pas un titre de 4 mots ou plus", () => {
      const titre = "La Grande Quête des Anciens Rois";
      const a = composerAventure({ titre, genre: "Fantasy", difficulte: "normal" });
      expect(a.titre).toBe(titre);
    });
  });

  describe("combats et événements", () => {
    it("attache au moins un combat avec un enemyId valide", () => {
      const a = composerAventure({ titre: "Le Donjon Maudit", genre: "Fantasy", difficulte: "difficile" });
      const combats = a.embranchements.flatMap((e) => e.choix).filter((c) => c.consequence.combat);
      expect(combats.length).toBeGreaterThan(0);
      combats.forEach((c) => expect(typeof c.consequence.combat!.enemyId).toBe("string"));
    });

    it("attache au moins un événement spécial", () => {
      const a = composerAventure({ titre: "Le Donjon Maudit", genre: "Horreur", difficulte: "normal" });
      const events = a.embranchements.flatMap((e) => e.choix).filter((c) => c.consequence.evenement);
      expect(events.length).toBeGreaterThan(0);
    });
  });
});
