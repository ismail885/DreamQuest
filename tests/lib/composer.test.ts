import { composerAventure } from "@/lib/generator/composition/composer";
import type { GenreNom, Difficulte } from "@/lib/generator/composition/types";

describe("composerAventure — moteur de generation theme x genre x difficulte", () => {
  describe("detection de theme et entrees", () => {
    it("fonctionne avec un titre a mot-cle (chateau)", () => {
      const a = composerAventure({ titre: "Le Château Hanté", genre: "Horreur", difficulte: "normal" });
      expect(a.lieu.length).toBeGreaterThan(0);
      expect(a.noeuds.length).toBeGreaterThan(0);
    });

    it("ignore accents et casse", () => {
      const a = composerAventure({ titre: "LA FÔRET MAUDITE", genre: "Fantasy", difficulte: "normal" });
      expect(a.noeuds.length).toBeGreaterThan(0);
    });

    it("retourne le genre identique", () => {
      const genres: GenreNom[] = [
        "Science-Fiction", "Fantasy", "Horreur", "Policier", "Western",
        "Pirate", "Cyberpunk", "Mythologique", "Romance",
      ];
      for (const g of genres) {
        expect(composerAventure({ titre: "Test", genre: g, difficulte: "normal" }).genre).toBe(g);
      }
    });

    it("retourne la difficulte identique", () => {
      const diffs: Difficulte[] = ["facile", "normal", "difficile", "legendaire"];
      for (const d of diffs) {
        expect(composerAventure({ titre: "Test", genre: "Fantasy", difficulte: d }).difficulte).toBe(d);
      }
    });

    it("retombe sur Fantasy / normal si invalide", () => {
      const a = composerAventure({ titre: "Test", genre: "X" as GenreNom, difficulte: "y" as Difficulte });
      expect(a.genre).toBe("Fantasy");
      expect(a.difficulte).toBe("normal");
    });
  });

  describe("structure du graphe", () => {
    it("a un noeud debut et au moins deux fins", () => {
      const a = composerAventure({ titre: "Le Donjon", genre: "Fantasy", difficulte: "difficile" });
      expect(a.noeuds.some((n) => n.id === "debut")).toBe(true);
      const fins = a.noeuds.filter((n) => n.fin);
      expect(fins.length).toBeGreaterThanOrEqual(2);
    });

    it("noeuds d'histoire : 2 choix avec cible ; fins : 0 choix", () => {
      const a = composerAventure({ titre: "Le Donjon", genre: "Fantasy", difficulte: "normal" });
      for (const n of a.noeuds) {
        if (n.fin) {
          expect(n.choix).toHaveLength(0);
        } else {
          expect(n.choix).toHaveLength(2);
          for (const c of n.choix) {
            expect(c.libelle.length).toBeGreaterThan(0);
            expect(c.cible.length).toBeGreaterThan(0);
            expect(c.consequence.texte.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it("toutes les cibles pointent vers un noeud existant", () => {
      const a = composerAventure({ titre: "La Crypte", genre: "Horreur", difficulte: "legendaire" });
      const ids = new Set(a.noeuds.map((n) => n.id));
      for (const n of a.noeuds) {
        for (const c of n.choix) {
          expect(ids.has(c.cible)).toBe(true);
        }
      }
    });

    it("aucun placeholder non remplace", () => {
      const a = composerAventure({ titre: "Le Temple", genre: "Mythologique", difficulte: "difficile" });
      expect(JSON.stringify(a)).not.toMatch(/\{lieu\}|\{decor\}|\{antagoniste\}|\{titre\}|\{lieuHabille\}/);
    });
  });

  describe("longueur variable selon la difficulte", () => {
    it("facile : entre 6 et 8 noeuds au total (4-6 + 2 fins)", () => {
      for (let i = 0; i < 20; i++) {
        const n = composerAventure({ titre: "Test", genre: "Fantasy", difficulte: "facile" }).noeuds.length;
        expect(n).toBeGreaterThanOrEqual(6);
        expect(n).toBeLessThanOrEqual(8);
      }
    });

    it("legendaire : entre 11 et 14 noeuds au total (9-12 + 2 fins)", () => {
      for (let i = 0; i < 20; i++) {
        const n = composerAventure({ titre: "Test", genre: "Fantasy", difficulte: "legendaire" }).noeuds.length;
        expect(n).toBeGreaterThanOrEqual(11);
        expect(n).toBeLessThanOrEqual(14);
      }
    });
  });

  describe("contenu", () => {
    it("3 tags, description et titre non vides", () => {
      const a = composerAventure({ titre: "Test", genre: "Cyberpunk", difficulte: "normal" });
      expect(a.tags).toHaveLength(3);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.titre.length).toBeGreaterThan(0);
    });

    it("enrichit un titre court avec le lieu", () => {
      const a = composerAventure({ titre: "Le Temple", genre: "Mythologique", difficulte: "normal" });
      expect(a.titre).toContain("-");
    });

    it("attache au moins un combat et un evenement", () => {
      let combats = 0;
      let events = 0;
      for (let i = 0; i < 10; i++) {
        const a = composerAventure({ titre: "Le Donjon Maudit", genre: "Fantasy", difficulte: "difficile" });
        const choix = a.noeuds.flatMap((n) => n.choix);
        combats += choix.filter((c) => c.consequence.combat).length;
        events += choix.filter((c) => c.consequence.evenement).length;
      }
      expect(combats).toBeGreaterThan(0);
      expect(events).toBeGreaterThan(0);
    });
  });
});
