import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies the adventure generation request to Anthropic's Claude API.
 * The API key is read server-side from the environment variable ANTHROPIC_API_KEY.
 * If no key is configured, falls back to a local generation response.
 */

const SYSTEM_PROMPT = `Tu es un générateur d'aventures interactives pour le jeu DreamQuest.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni backticks ni texte en dehors du JSON.

CONTEXTE DU JEU :
- DreamQuest est un RPG textuel immersif où chaque choix du joueur influence l'histoire
- Les aventures doivent être cohérentes avec le genre et le titre donnés
- Les textes doivent être engageants, en français, avec une atmosphère soignée
- Chaque nœud non-final propose 2 choix pertinents qui font avancer l'histoire

Format de réponse attendu :
{
  "nodes": [
    {
      "id": "debut",
      "label": "Début",
      "text": "2-3 paragraphes narratifs immersifs décrivant la scène, l'atmosphère et les événements",
      "isEnd": false,
      "choices": [
        { "label": "Action concrète du joueur (un verbe d'action)", "target": "n2" },
        { "label": "Autre action possible", "target": "n3" }
      ]
    },
    {
      "id": "n2",
      "label": "N2",
      "text": "...",
      "isEnd": false,
      "choices": [{ "label": "...", "target": "n4" }]
    }
  ]
}

RÈGLES NARRATIVES :
- Génère 6 à 8 nœuds au total, dont 2 nœuds finaux (isEnd: true, choices: [])
- Chaque nœud non-final a exactement 2 choix
- Les textes sont immersifs, en français, avec 2-3 paragraphes (atmosphère, dialogues, descriptions)
- Les IDs suivent le pattern : "debut", "n2", "n3", "n4", etc.
- Les targets des choix pointent toujours vers des IDs existants
- Le nœud "debut" est toujours le premier
- Les nœuds finaux ont des IDs comme "fin1", "fin2" ou "nX" avec isEnd:true
- Inclure des conséquences implicites dans les choix (récompenses, danger, découvertes)
- L'histoire doit avoir un arc narratif : introduction → développement → climax → résolution
- Les choix doivent être nuancés (pas de bien/mal évident)
- Chaque fin doit être satisfaisante et en lien avec le thème`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, genre } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Si pas de clé API → fallback local
    if (!apiKey) {
      const fallbackNodes = [
        {
          id: "debut",
          label: "Début",
          text: `Bienvenue dans "${title}". ${genre ? `Genre : ${genre}. ` : ""}L'aventure commence maintenant. Vous ouvrez les yeux dans un lieu inconnu. L'air est lourd, chargé d'une atmosphère étrange. Autour de vous, des murs de pierre ancienne sont ornés de symboles qui semblent briller faiblement dans la pénombre.\n\nUne voix résonne dans votre esprit : « Ainsi tu es arrivé. Nous t'attendions. Prépare-toi, car ton jugement commence maintenant. »`,
          isEnd: false,
          choices: [
            { label: "Examiner les symboles sur les murs", target: "n2" },
            { label: "Avancer dans le couloir devant vous", target: "n3" },
          ],
        },
        {
          id: "n2",
          label: "N2",
          text: "Les symboles s'animent sous votre regard. Ils racontent une histoire ancienne — une prophétie. Vous distinguez des figures de guerriers, de monstres et d'un artefact lumineux au centre. Le message est clair : un grand danger menace, et vous êtes l'élu.\n\nSoudain, le sol tremble. Des bruits de pas résonnent au loin.",
          isEnd: false,
          choices: [
            { label: "Suivre le bruit des pas", target: "n4" },
            { label: "Chercher une arme dans les débris", target: "n5" },
          ],
        },
        {
          id: "n3",
          label: "N3",
          text: "Le couloir s'étend à perte de vue, éclairé par des torches qui brûlent d'une flamme bleutée. Après plusieurs minutes de marche, vous débouchez sur une immense salle circulaire. Au centre, un pilier de cristal pulse d'une lumière aveuglante.\n\nUne silhouette encapuchonnée se tient près du pilier. Elle ne bouge pas, mais vous sentez son regard posé sur vous.",
          isEnd: false,
          choices: [
            { label: "Parler à la silhouette", target: "n4" },
            { label: "Toucher le pilier de cristal", target: "n5" },
          ],
        },
        {
          id: "n4",
          label: "N4",
          text: "La silhouette se retourne lentement. Sous la cape, un visage ancien, marqué par le temps, vous sourit. « Tu as fait le bon choix, » dit-elle d'une voix douce. « Mais l'épreuve ne fait que commencer. Prends ceci, et souviens-toi : le pouvoir est en toi. »\n\nElle vous tend un pendentif lumineux. Dès que vous le touchez, une chaleur réconfortante envahit votre corps.",
          isEnd: true,
          choices: [],
        },
        {
          id: "n5",
          label: "N5",
          text: "Une lumière aveuglante vous submerge. Le monde bascule. Vous sentez une présence immense, ancienne, qui vous traverse de part en part. Des visions défilent devant vos yeux — des batailles, des mondes, des étoiles qui s'éteignent.\n\nQuand vous revenez à vous, tout a changé. Vous comprenez maintenant. L'aventure ne fait que commencer, mais vous n'êtes plus le même.",
          isEnd: true,
          choices: [],
        },
      ];

      return NextResponse.json({
        content: [{ text: JSON.stringify({ nodes: fallbackNodes }) }],
        _fallback: true,
      });
    }

    // Appel réel à l'API Anthropic
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
            messages: [
            {
              role: "user",
              content: `Génère une aventure intitulée "${title}" de genre ${genre || "aventure"}.

Détails :
- Titre : "${title}"
- Genre : ${genre || "aventure"}
- Style : narratif et immersif, en français
- Structure : 6 à 8 nœuds dont 2 fins
- Chaque nœud non-final doit avoir 2 choix qui font avancer l'histoire
- Les textes doivent être détaillés (2-3 paragraphes) avec une ambiance cohérente
- Les fins doivent être satisfaisantes et en lien avec l'histoire`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return NextResponse.json(
        { error: `Erreur API : ${response.status}` },
        { status: 502 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      content: data.content,
      usage: data.usage,
      model: data.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("generate-adventure error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
