import { NextRequest, NextResponse } from "next/server";
import { composerAventure } from "@/lib/generator/composition/composer";

// Génère une aventure complète à partir d'un titre, d'un genre et d'une difficulté.
// Moteur de composition local : aucune IA, aucun appel externe. Ne touche pas à la BDD.

const TITRE_MAX = 100;

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }

    const titreRaw = body.titre ?? body.title;
    if (typeof titreRaw !== "string" || titreRaw.trim() === "") {
      return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }
    const titre = titreRaw.trim();
    if (titre.length > TITRE_MAX) {
      return NextResponse.json(
        { error: `Le titre ne doit pas dépasser ${TITRE_MAX} caractères` },
        { status: 400 },
      );
    }

    const genre = typeof body.genre === "string" ? body.genre : "Fantasy";
    const difficulte =
      typeof body.difficulte === "string"
        ? body.difficulte
        : typeof body.difficulty === "string"
          ? (body.difficulty as string)
          : "normal";

    const aventure = composerAventure({
      titre,
      genre: genre as never,
      difficulte: difficulte as never,
    });

    return NextResponse.json(aventure, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur generate-story:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération", details: message },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
