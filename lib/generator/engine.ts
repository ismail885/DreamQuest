import type { GeneratedNode, GenreContent, GeneratorInput, GeneratedAdventure } from "./types";
import { FANTASY_CONTENT } from "./fantasy";
import { HORROR_CONTENT } from "./horror";
import { SCIFI_CONTENT } from "./scifi";
import { ROMANCE_CONTENT } from "./romance";
import { PIRATE_CONTENT } from "./pirate";
import { CYBERPUNK_CONTENT } from "./cyberpunk";
import { MYTHOLOGIQUE_CONTENT } from "./mythologique";
import { WESTERN_CONTENT } from "./western";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function pickUnique<T>(arr: T[], used: Set<T>): T {
  const available = arr.filter((item) => !used.has(item));
  if (available.length === 0) return pick(arr);
  return pick(available);
}

function getContentForGenre(genre: string): GenreContent {
  switch (genre) {
    case "horror":
      return HORROR_CONTENT;
    case "scifi":
      return SCIFI_CONTENT;
    case "romance":
      return ROMANCE_CONTENT;
    case "pirate":
      return PIRATE_CONTENT;
    case "cyberpunk":
      return CYBERPUNK_CONTENT;
    case "mythologique":
      return MYTHOLOGIQUE_CONTENT;
    case "western":
      return WESTERN_CONTENT;
    default:
      return FANTASY_CONTENT;
  }
}

function generateDescription(title: string, genre: string): string {
  const genreDescriptions: Record<string, string[]> = {
    fantasy: [
      `Une épopée fantastique intitulée "${title}". Un voyage rempli de magie, de mystères et de créatures légendaires. Forgez votre destinée dans un royaume où les choix déterminent l'avenir.`,
      `"${title}" - Une quête épique dans un monde de fantasy peuplé de héros courageux et de royaumes lointains. Chaque décision vous rapproche de la gloire ou du danger.`,
      `Plongez dans "${title}", une aventure magique où chaque choix façonne votre destin. Explorez des terres oubliées et affrontez des forces anciennes.`,
    ],
    horror: [
      `"${title}" - Une histoire d'horreur qui vous glacera le sang. Découvrez les secrets terrifiants qui vous attendent dans l'obscurité. Survivrez-vous ?`,
      `Une aventure horrifiante intitulée "${title}". Explorez les ténèbres et survivez si vous le pouvez. Chaque ombre cache un danger mortel.`,
      `"${title}" - Un thriller sombre rempli de suspense, de frissons et de révélations dérangeantes. La peur n'a jamais été aussi palpable.`,
    ],
    scifi: [
      `"${title}" - Une aventure de science-fiction futuriste. Explorez des mondes technologiques avancés, résolvez des mystères cosmiques et repoussez les limites de l'univers.`,
      `Voyagez dans "${title}", une odyssée spatiale remplie de technologie avancée, de civilisations extraterrestres et d'explorations interstellaires périlleuses.`,
      `"${title}" - Un voyage sci-fi captivant à travers l'univers, où l'impossible devient réalité. L'avenir de la galaxie repose entre vos mains.`,
    ],
    pirate: [
      `"${title}" - Une aventure de pirates à travers les mers. Trésors, batailles navales et trahisons vous attendent dans cette quête de gloire et d'or.`,
      `Hissez les voiles pour "${title}" ! Une épopée maritime pleine de flibustiers, de sirènes et de trésors maudits. L'océan vous appelle.`,
      `"${title}" - Une histoire de piraterie où les canons tonnent, le rhum coule et où votre légende s'écrit dans le sang et la poudre.`,
    ],
    cyberpunk: [
      `"${title}" - Plongez dans un futur dystopique où les mégacorporations règnent et les implants cybernétiques sont la clé du pouvoir.`,
      `Bienvenue dans "${title}" — un monde de néons, de hackers et de trahisons. Dans cette jungle d'acier, seuls les plus forts survivent.`,
      `"${title}" - Une aventure cyberpunk où la frontière entre l'humain et la machine s'estompe. Votre libre arbitre est votre seule arme.`,
    ],
    mythologique: [
      `"${title}" - Une épopée mythologique où les dieux et les héros s'affrontent. Le destin du monde est entre vos mains dignes d'un demi-dieu.`,
      `Plongez dans "${title}", une aventure inspirée des légendes antiques. Parcourez l'Olympe, les Enfers et les neuf mondes nordiques.`,
      `"${title}" - Une quête divine où vous marchez aux côtés des dieux et des héros de la mythologie. L'immortalité vous attend au bout du chemin.`,
    ],
    western: [
      `"${title}" - Une aventure western dans les plaines de l'Ouest sauvage. Duels au soleil, chevauchées et justice au bout du revolver.`,
      `Bienvenue dans "${title}", une histoire de cow-boys, de hors-la-loi et de vastes étendues désertiques. L'Ouest vous attend.`,
      `"${title}" - Une épopée du Far West où l'honneur se gagne à la sueur et au plomb. La poussière de la piste vous appelle.`,
    ],
    romance: [
      `"${title}" - Une histoire d'amour captivante où les cœurs se nouent et les destins s'entrelacent. Entre passion et sacrifice, quel chemin choisirez-vous ?`,
      `Découvrez "${title}", une romance passionnante remplie d'émotions, de rencontres inattendues, de trahisons et de moments magiques.`,
      `"${title}" - Une aventure romantique où l'amour triomphe contre tous les obstacles. Les sentiments seront-ils plus forts que les épreuves ?`,
    ],
  };

  const descriptions = genreDescriptions[genre] || genreDescriptions.fantasy;
  return pick(descriptions);
}

/**
 * Génère 2 choix contextuels basés sur le type d'événement et le contenu disponible.
 */
function generateContextualChoices(
  content: GenreContent,
  phase: "early" | "mid" | "climax",
  context: {
    currentLocation?: { name: string; description: string };
    currentNpc?: { name: string; role: string; description: string };
    hasArtifact?: boolean;
    hasMonster?: boolean;
    title: string;
  },
): { choices: { text: string; consequence: string }[] } {
  const templates: { condition: () => boolean; choices: [string, string]; consequence: string }[] = [];

  // Choix basés sur le lieu actuel
  if (context.currentLocation) {
    const loc = context.currentLocation.name;
    templates.push(
      {
        condition: () => true,
        choices: [
          `Explorer ${loc} en profondeur`,
          `Quitter ${loc} et continuer votre chemin`,
        ],
        consequence: `L'exploration de ${loc} révèle des détails importants pour la suite.`,
      },
      {
        condition: () => phase === "early",
        choices: [
          `Fouiller les environs de ${loc}`,
          `Chercher des habitants aux alentours`,
        ],
        consequence: `Vous découvrez des indices dissimulés dans ${loc}.`,
      },
    );
  }

  // Choix basés sur la présence d'un PNJ
  if (context.currentNpc) {
    const npc = context.currentNpc.name;
    templates.push(
      {
        condition: () => phase === "early",
        choices: [
          `Demander de l'aide à ${npc}`,
          `Observer ${npc} avant de vous manifester`,
        ],
        consequence: `${npc} vous jauge d'un regard entendu.`,
      },
      {
        condition: () => phase === "mid",
        choices: [
          `Faire confiance à ${npc} et suivre son conseil`,
          `Vous méfier de ${npc} et garder vos distances`,
        ],
        consequence: `Votre relation avec ${npc} prend un tournant décisif.`,
      },
    );
  }

  // Choix basés sur les artefacts
  if (context.hasArtifact && content.artifacts.length > 0) {
    const art = pick(content.artifacts);
    templates.push({
      condition: () => phase !== "early",
      choices: [
        `Utiliser ${art.name} pour progresser`,
        `Garder ${art.name} pour un moment plus critique`,
      ],
      consequence: `${art.name} pourrait être la clé de votre réussite... ou votre perte.`,
    });
  }

  // Choix basés sur les monstres
  if (context.hasMonster && content.monsters.length > 0) {
    const mon = pick(content.monsters);
    templates.push({
      condition: () => phase === "mid" || phase === "climax",
      choices: [
        `Affronter ${mon} directement`,
        `Tendre un piège à ${mon} en utilisant le terrain`,
      ],
      consequence: `Le combat contre ${mon} mettra toutes vos compétences à l'épreuve.`,
    });
  }

  // Choix de phase spécifiques
  if (phase === "early") {
    templates.push(
      {
        condition: () => true,
        choices: [
          "Suivre la piste principale",
          "Explorer un chemin secondaire intrigant",
        ],
        consequence: "Chaque chemin révèle une facette différente de cette histoire.",
      },
      {
        condition: () => true,
        choices: [
          "Agir avec prudence et discrétion",
          "Prendre les devants avec audace",
        ],
        consequence: "Votre approche influencera la perception que les autres ont de vous.",
      },
      {
        condition: () => true,
        choices: [
          "Chercher des alliés parmi les habitants",
          "Compter sur vos propres compétences",
        ],
        consequence: "Les alliances forgées maintenant pourraient s'avérer cruciales plus tard.",
      },
    );
  } else if (phase === "mid") {
    templates.push(
      {
        condition: () => true,
        choices: [
          "Approfondir le mystère en quête de vérité",
          "Passer à l'action avant qu'il ne soit trop tard",
        ],
        consequence: "La frontière entre la curiosité et la témérité est mince.",
      },
      {
        condition: () => true,
        choices: [
          "Négocier avec les forces en présence",
          "Préparer un assaut décisif",
        ],
        consequence: "Diplomatie ou violence ? Votre choix définira votre voie.",
      },
      {
        condition: () => true,
        choices: [
          "Décrypter les indices accumulés",
          "Suivre votre instinct",
        ],
        consequence: "La raison et l'intuition sont deux armes aussi puissantes l'une que l'autre.",
      },
    );
  } else {
    templates.push(
      {
        condition: () => true,
        choices: [
          "Prendre tous les risques pour une victoire totale",
          "Assurer vos arrières et minimiser les pertes",
        ],
        consequence: "Le moment crucial est arrivé. Votre décision résonnera pour toujours.",
      },
      {
        condition: () => true,
        choices: [
          "Faire le sacrifice nécessaire",
          "Trouver une autre voie, quoi qu'il en coûte",
        ],
        consequence: "Parfois, il n'y a pas de bon choix. Seulement des choix et leurs conséquences.",
      },
      {
        condition: () => true,
        choices: [
          "Libérer le pouvoir que vous avez découvert",
          "Le sceller à jamais pour protéger les autres",
        ],
        consequence: "Le pouvoir absolu corrompt absolument. Mais l'impuissance aussi.",
      },
    );
  }

  const valid = templates.filter((t) => t.condition());
  const selected = pick(valid.length > 0 ? valid : [{ condition: () => true, choices: ["Continuer votre route", "Prendre le temps d'observer"] as [string, string], consequence: "Chaque décision vous rapproche du dénouement." }]);

  return {
    choices: [
      { text: selected.choices[0], consequence: selected.consequence },
      { text: selected.choices[1], consequence: selected.consequence },
    ],
  };
}

export function generateAdventure(input: GeneratorInput): GeneratedAdventure {
  const { genre, title, longueur } = input;
  const content = getContentForGenre(genre);
  const usedLocations = new Set<{ name: string; description: string }>();
  const usedNpcs = new Set<{ name: string; role: string; description: string }>();
  const usedTwists = new Set<string>();
  const usedArtifacts = new Set<{ name: string; description: string }>();

  let nodeCount: number;
  switch (longueur) {
    case "court":
      nodeCount = 5 + Math.floor(Math.random() * 3); // 5-7
      break;
    case "long":
      nodeCount = 15 + Math.floor(Math.random() * 8); // 15-22
      break;
    default:
      nodeCount = 10 + Math.floor(Math.random() * 5); // 10-14
  }

  const description = input.description || generateDescription(title, genre);

  const difficulty: "easy" | "normal" | "hard" =
    nodeCount < 12 ? "easy" : nodeCount < 14 ? "normal" : "hard";

  const duree_estimee = nodeCount * 5;

  const nodes: GeneratedNode[] = [];

  const hook = pick(content.plotHooks);
  const startLocation = pick(content.locations);
  usedLocations.add(startLocation);

  const hasMonster = content.monsters.length > 0 && Math.random() < 0.4;
  const monsterName = hasMonster ? pick(content.monsters) : null;

  const rootText = `"${title}"\n\n${hook}\n\nVotre périple débute à ${startLocation.name}. ${startLocation.description}${
    hasMonster ? `\n\nDes rumeurs parlent d'une menace : ${monsterName} rôderait dans les parages...` : ""
  }`;

  nodes.push({
    id: "root",
    text: rootText,
    choices: [
      { text: `Explorer les environs de ${startLocation.name}`, link: "node_0", consequences: "Les premiers pas sont toujours les plus importants." },
      { text: "Chercher des habitants pour obtenir des informations", link: "node_1", consequences: "Les langues locales en savent souvent plus qu'elles ne le laissent paraître." },
    ],
  });

  let currentLocation = startLocation;
  let currentNpc: { name: string; role: string; description: string } | null = null;
  let hasArtifact = false;
  let artifactObj: { name: string; description: string } | null = null;
  let twistRevealed = false;

  const depth = Math.floor(nodeCount / 3);

  for (let i = 0; i < nodeCount - 2; i++) {
    const phase = i < depth ? "early" : i < depth * 2 ? "mid" : "climax";
    let eventText: string;

    // Contexte pour les choix
    const contextForChoices = {
      currentLocation,
      currentNpc: currentNpc ?? undefined,
      hasArtifact,
      hasMonster: hasMonster ?? false,
      title,
    };

    if (phase === "early") {
      // Phase d'introduction : NPCs, lieux, découvertes
      if (Math.random() < 0.45 && content.npcs.length > 0) {
        const npc = pickUnique(content.npcs, usedNpcs);
        usedNpcs.add(npc);
        currentNpc = npc;
        const ev = pick(content.earlyEvents);
        eventText = `Vous rencontrez ${npc.name}, ${npc.role}. ${npc.description}\n\n« ${npc.name} vous observe avec attention. »\n\n${ev.text}`;

        // Découverte d'artefact possible
        if (!hasArtifact && content.artifacts.length > 0 && Math.random() < 0.25) {
          artifactObj = pickUnique(content.artifacts, usedArtifacts);
          usedArtifacts.add(artifactObj);
          hasArtifact = true;
          eventText += `\n\n${npc.name} vous montre un objet mystérieux : ${artifactObj.name}. ${artifactObj.description}`;
        }

        if (monsterName && Math.random() < 0.2) {
          eventText += `\n\n« Attention, » murmure ${npc.name}, « ${monsterName} a été signalé non loin d'ici... »`;
        }
      } else if (Math.random() < 0.35) {
        const newLocation = pickUnique(content.locations, usedLocations);
        usedLocations.add(newLocation);
        currentLocation = newLocation;
        const ev = pick(content.earlyEvents);
        eventText = `Vous arrivez à ${newLocation.name}. ${newLocation.description}\n\n${ev.text}`;

        if (!hasArtifact && content.artifacts.length > 0 && Math.random() < 0.3) {
          artifactObj = pickUnique(content.artifacts, usedArtifacts);
          usedArtifacts.add(artifactObj);
          hasArtifact = true;
          eventText += `\n\nParmi les décombres, vous découvrez ${artifactObj.name}. ${artifactObj.description}`;
        }
      } else {
        const ev = pick(content.earlyEvents);
        eventText = ev.text;

        if (!hasArtifact && content.artifacts.length > 0 && Math.random() < 0.2) {
          artifactObj = pickUnique(content.artifacts, usedArtifacts);
          usedArtifacts.add(artifactObj);
          hasArtifact = true;
          eventText += `\n\nAu détour du chemin, vous tombez sur ${artifactObj.name}. ${artifactObj.description}`;
        }
      }
    } else if (phase === "mid") {
      // Phase de développement : twists, conflits, révélations
      if (!twistRevealed && Math.random() < 0.35 && usedTwists.size < content.twists.length) {
        const twist = pickUnique(content.twists, usedTwists);
        usedTwists.add(twist);
        twistRevealed = true;
        const ev = pick(content.midEvents);
        eventText = `--- Révélation ---\n${twist}\n\n${ev.text}`;
      } else if (currentNpc && Math.random() < 0.3) {
        const ev = pick(content.midEvents);
        eventText = `${currentNpc.name} vous retrouve. ${currentNpc.description}\n\n« Je t'attendais, » dit ${currentNpc.name}. « Les choses ont changé depuis notre dernière rencontre. »\n\n${ev.text}`;
      } else {
        const newLocation = pickUnique(content.locations, usedLocations);
        usedLocations.add(newLocation);
        currentLocation = newLocation;
        const ev = pick(content.midEvents);
        eventText = `Vous atteignez ${newLocation.name}. ${newLocation.description}\n\n${ev.text}`;
      }

      if (hasArtifact && artifactObj && Math.random() < 0.3) {
        eventText += `\n\n${artifactObj.name} pulse d'une lumière soudaine, comme s'il réagissait à ce qui vous entoure.`;
      }
    } else {
      // Phase de climax : affrontements, sacrifices, décisions finales
      const ev = pick(content.climaxEvents);
      eventText = ev.text;

      if (currentNpc) {
        eventText += `\n\n${currentNpc.name} se tient à vos côtés. Le moment de vérité est arrivé.`;
      }

      if (hasArtifact && artifactObj) {
        eventText += `\n\n${artifactObj.name} émet une lueur intense. Son pouvoir est à son apogée.`;
      }

      if (monsterName) {
        eventText += `\n\nSoudain, un grondement terrifiant : ${monsterName} apparaît, bloquant votre chemin.`;
      }

          eventText += `\n\n« Ainsi se conclut "${title}"... » murmure une voix dans le vent.`;
    }

      const { choices } = generateContextualChoices(content, phase, contextForChoices);

    const isEnd = i >= nodeCount - 3;

    nodes.push({
      id: `node_${i}`,
      text: eventText,
      choices: choices.map((c, idx) => ({
        text: c.text,
        link: isEnd ? `ending_${idx}` : `node_${i + 1}`,
        consequences: c.consequence,
      })),
    });
  }

  const endingCount = 2 + Math.floor(Math.random() * 2);
  const endingSet = pickN(content.endings, endingCount);

  for (let i = 0; i < endingSet.length; i++) {
    const ending = endingSet[i];
    let endingText = `${ending.text}\n\n${ending.condition}`;

    if (currentNpc && Math.random() < 0.4) {
      endingText += `\n\n${currentNpc.name} vous observe une dernière fois, un sourire énigmatique aux lèvres. « Ainsi s'achève notre histoire... pour l'instant. »`;
    }

    if (hasArtifact && artifactObj) {
      endingText += `\n\n${artifactObj.name} s'éteint doucement, sa mission accomplie.`;
    }

    nodes.push({
      id: `ending_${i}`,
      text: endingText,
      choices: [],
      isEnd: true,
    });
  }

  return {
    nodes,
    description,
    difficulty,
    duree_estimee,
  };
}
