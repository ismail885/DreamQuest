import type { GeneratedNode, GenreContent, GeneratorInput, GeneratedAdventure } from "./types";
import { FANTASY_CONTENT } from "./fantasy";
import { HORROR_CONTENT } from "./horror";
import { SCIFI_CONTENT } from "./scifi";
import { ROMANCE_CONTENT } from "./romance";

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
    default:
      return FANTASY_CONTENT;
  }
}

function generateDescription(title: string, genre: string): string {
  const genreDescriptions: Record<string, string[]> = {
    fantasy: [
      `Une épopée fantastique intitulée "${title}". Un voyage rempli de magie, de mystères et de créatures légendaires.`,
      `"${title}" - Une quête épique dans un monde de fantasy peuplé de héros courageux et de royaumes lointains.`,
      `Plongez dans "${title}", une aventure magique où chaque choix façonne votre destin.`,
    ],
    horror: [
      `"${title}" - Une histoire d'horreur qui vous glaçera le sang. Découvrez les secrets terrifiants qui l'attendent.`,
      `Une aventure horrifiante intitulée "${title}". Explorez les ténèbres et survivez si vous le pouvez.`,
      `"${title}" - Un thriller sombre rempli de suspense, de frissons et de révélations dérangeantes.`,
    ],
    scifi: [
      `"${title}" - Une aventure de science-fiction futuriste. Explorez des mondes technologiques et des mystères cosmiques.`,
      `Voyagez dans "${title}", une odyssée spatiale remplie de technologie avancée et d'explorations interstellaires.`,
      `"${title}" - Un voyage sci-fi captivant à travers l'univers, où l'impossible devient réalité.`,
    ],
    romance: [
      `"${title}" - Une histoire d'amour captivante où les cœurs se nouent et les destins s'entrelacent.`,
      `Découvrez "${title}", une romance passionnante remplie d'émotions, de rencontres inattendues et de moments magiques.`,
      `"${title}" - Une aventure romantique où l'amour triomphe contre tous les obstacles.`,
    ],
  };

  const descriptions = genreDescriptions[genre] || genreDescriptions.fantasy;
  return pick(descriptions);
}

export function generateAdventure(input: GeneratorInput): GeneratedAdventure {
  const { genre, title, description: userDescription } = input;
  const content = getContentForGenre(genre);
  const usedLocations = new Set<{ name: string; description: string }>();
  const usedNpcs = new Set<{ name: string; role: string; description: string }>();
  const usedTwists = new Set<string>();
  const nodeCount = 10 + Math.floor(Math.random() * 6); // 10-15 nodes

  // Générer une description si elle n'existe pas
  const description = userDescription || generateDescription(title, genre);
  
  // Générer la difficulté basée sur le nombre de nœuds
  const difficulty: "easy" | "normal" | "hard" = 
    nodeCount < 12 ? "easy" : nodeCount < 14 ? "normal" : "hard";
  
  // Estimer la durée (en minutes) : ~3-5 min par nœud
  const duree_estimee = nodeCount * 4;

  const nodes: GeneratedNode[] = [];

  // ─── ROOT NODE ───
  const hook = pick(content.plotHooks);
  const location = pick(content.locations);
  usedLocations.add(location);
  const rootText = `${hook}\n\nVotre aventure commence à ${location.name}. ${location.description}`;

  const rootChoices = [
    `Explorer les environs de ${location.name}`,
    "Chercher des habitants ou des informations",
    "Suivre une piste mystérieuse au loin",
  ];

  nodes.push({
    id: "root",
    text: rootText,
    choices: rootChoices.map((text, i) => ({
      text,
      link: `node_0_${i}`,
      consequences: "",
    })),
  });

  // ─── CONTENT NODES ───
  const depth = Math.floor(nodeCount / 3);

  for (let i = 0; i < nodeCount - 2; i++) {
    let eventText: string;
    let consequence = "";
    const phase = i < depth ? "early" : i < depth * 2 ? "mid" : "climax";

    if (phase === "early") {
      // Early game: exploration, meeting NPCs, first challenges
      if (Math.random() < 0.4 && content.npcs.length > 0) {
        const npc = pickUnique(content.npcs, usedNpcs);
        usedNpcs.add(npc);
        const events = content.earlyEvents;
        const ev = pick(events);
        eventText = `Vous rencontrez ${npc.name}, ${npc.role}. ${npc.description}\n\n${ev.text}`;
        consequence = ev.consequence;
      } else if (Math.random() < 0.3) {
        const newLocation = pickUnique(content.locations, usedLocations);
        usedLocations.add(newLocation);
        const events = content.earlyEvents;
        const ev = pick(events);
        eventText = `Vous arrivez à ${newLocation.name}. ${newLocation.description}\n\n${ev.text}`;
        consequence = ev.consequence;
      } else {
        const ev = pick(content.earlyEvents);
        eventText = ev.text;
        consequence = ev.consequence;
      }
    } else if (phase === "mid") {
      // Mid game: rising tension, twists, harder choices
      if (Math.random() < 0.3 && usedTwists.size < content.twists.length) {
        const twist = pickUnique(content.twists, usedTwists);
        usedTwists.add(twist);
        const ev = pick(content.midEvents);
        eventText = `${twist}\n\n${ev.text}`;
        consequence = ev.consequence;
      } else {
        const ev = pick(content.midEvents);
        eventText = ev.text;
        consequence = ev.consequence;
      }
    } else {
      // Climax: final confrontations
      const ev = pick(content.climaxEvents);
      eventText = ev.text;
      consequence = ev.consequence;
    }

    // Generate 3 choices with variety
    const choiceSet = pick(content.choiceSets);
    const choices = choiceSet.slice(0, 3).map((text, idx) => ({
      text,
      link: i < nodeCount - 3 ? `node_${i + 1}_${idx}` : `ending_${idx}`,
      consequences: idx === 0 ? consequence : "",
    }));

    nodes.push({
      id: `node_${i}`,
      text: eventText,
      choices,
      isEnd: false,
    });
  }

  // ─── ENDINGS ───
  const endingCount = 2 + Math.floor(Math.random() * 2); // 2-3 endings
  const endingSet = pickN(content.endings, endingCount);

  for (let i = 0; i < endingSet.length; i++) {
    const ending = endingSet[i];
    const endingText = `${ending.text}\n\n${ending.condition}`;

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


