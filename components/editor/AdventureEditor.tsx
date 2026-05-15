"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";

interface Choice {
  text: string;
  link: string;
  consequences: string;
  statChange?: {
    force?: number;
    agility?: number;
    magie?: number;
    endurance?: number;
  };
}

interface BranchNode {
  id: string;
  text: string;
  choices: Choice[];
  isEnd?: boolean;
}

interface GenreInfo {
  key: string;
  title: string;
  subtitle: string;
  accent: string;
}

// Générateur de contenu avancé avec titre personnalisé - VERSION COMPLÈTE
const generateAdventureContent = (genre: string, title: string): BranchNode[] => {
  const adventureTitle = (title || "").trim() || "Aventure";
  const titleUpper = adventureTitle.toUpperCase();
  const titleLower = adventureTitle.toLowerCase();

  // Bibliothèque complète d'événements par genre (sans utiliser library dans la définition)
  const getFantasyData = () => ({
    locations: ["Forêt des Murmures", "Château Noir", "Caverne du Dragon", "Village de Brume", "Temple Oublié", "Montagnes Écarlates", "Royaume du Nord", "Terre des Géants"],
    villains: ["le Sorcier Obscur", "le Dragon Ancêtre", "le Roi Démon", "l'Usurpateur", "le Créateur de Ténèbres"],
    artifacts: ["L'Épée du Destin", "Le Bouclier Éternel", "Le Livre des Ombres", "La Couronne de Lumière"],
    allies: ["un Vieux Sage", "un Ancien Magicien", "un Chevalier déchu", "une Fée bienveillante"],
    monsters: ["un Troll", "une Hydre", "un Chimère", "des Orcs"],
    openings: [
      `Dans le royaume de ${titleUpper}, une menace antique menace de tout détruire.`,
      `Le destin a choisi : vous êtes le seul espoir contre ${titleLower}.`
    ],
    events: [
      "Niv1_En traversant une région inconnue, vous rencontrez un allié inattendu.",
      "Niv1_Un groupe de créatures hostiles bloque votre chemin.",
      "Niv1_Vous trouvez des ruines anciennes contenant un indice précieux.",
      "Niv2_La vérité sur vos origines se révèle enfin.",
      "Niv2_Un ancien ennemi devient allié face à une menace plus grande.",
      "Niv3_L'affrontement final commence.",
      "Niv3_Le moment du choix final arrive."
    ],
    endings: [
      `Victoire! Vous avez sauvé le royaume et votre nom sera gravé dans la légende de ${titleUpper}.`,
      `Le prix de la victoire est élevé. Vous avez gagné, mais quelque chose en vous a changé.`
    ]
  });

  const getHorrorData = () => ({
    locations: ["Manoir Maudit", "Cimetière Écarlate", "Hôpital Désaffecté", "Forêt du Crépuscule"],
    villains: ["le Spectre Vengeur", "la Créature des Ténèbres", "le Tueur Fantôme"],
    secrets: ["un journal maudit", "un rituel interdit", "une vérité enfouie"],
    victims: ["une voix enfantine", "un whisper solitaire"],
    openings: [
      `La peur règne à ${titleUpper}, là où les ombres révèlent leur vraie forme.`,
      `Personne n'ose prononcer le nom de ${titleLower}. On dit qu'il réveille les morts.`
    ],
    events: [
      "Niv1_Une porte s'ouvre librement, comme si elle vous attendait.",
      "Niv1_Vous trouvez un indice mystérieux.",
      "Niv2_La vérité sur l'ennemi est horrible.",
      "Niv2_Le temps commence à se comporter étrangement.",
      "Niv3_La confrontation finale est inévitable.",
      "Niv3_Vous devenez ce que vous chassiez."
    ],
    endings: [
      `Vous avez survécu, mais les cauchemars de ${titleLower} ne vous quitteront jamais.`,
      `La vérité était trop horrible.`
    ]
  });

  const getScifiData = () => ({
    locations: ["Station Orbitale", "Planète Inconnue", "Vaisseau Fantôme", "Colonie Lunaire"],
    villains: ["l'IA Rebelle", "les Extraterrestres", "la Corporation"],
    techs: ["une technologie perdue", "un artefact alien", "un ordinateur quantique"],
    allies: ["un androïde errant", "une espèce pacifiste", "une IA bienveillante"],
    openings: [
      `L'an 2347. Votre mission : investiguer le mystère de ${titleUpper}.`,
      `Le signal de ${titleLower} a été détecté. Personne n'a jamais exploré cette région.`
    ],
    events: [
      "Niv1_Votre scanner détecte une structure artificielle.",
      "Niv1_Vous rencontrez un allié inattendu.",
      "Niv2_La vérité sur l'ennemi vous choque.",
      "Niv2_Une décision difficile doit être prise.",
      "Niv3_L'affrontement final est inévitable.",
      "Niv3_La décision finale approche."
    ],
    endings: [
      `Votre découverte a changé le cours de l'histoire humaine à jamais.`,
      `Votre sacrifice sera mémorisé par les générations futures.`
    ]
  });

  const getRomanceData = () => ({
    locations: ["Café Littéraire", "Jardin des Rêves", "Musée des Étoiles", "Plage au Crépuscule"],
    obstacles: ["un mensonge", "une différence sociale", "un secret", "une promesse"],
    moments: ["un regard échangé", "une main effleurée", "un silence complice"],
    partners: ["une âme sensible", "un esprit indépendant", "un cœur généreux"],
    openings: [
      `Dans les rues de ${titleUpper}, les destins se croisent pour l'éternité.`,
      `L'amour ne suit pas de règles, surtout à ${titleLower}.`
    ],
    events: [
      "Niv1_Votre regard croise celui d'une personne spéciale.",
      "Niv1_Une pluie soudaine vous force à chercher un abri ensemble.",
      "Niv2_La vérité sur un obstacle est révélée.",
      "Niv2_Une nouvelle personne entre en scène.",
      "Niv3_Le moment de la vérité arrive.",
      "Niv3_L'engagement approche."
    ],
    endings: [
      `Vous avez trouvé l'amour véritable à ${titleUpper}.`,
      `Certains amours durent éternellement.`
    ]
});

  // Nombre aléatoire de nœuds (entre 8 et 15)
  const nodeCount = 8 + Math.floor(Math.random() * 8); // 8 à 15 nœuds
  
  // Sélectionner les données selon le genre
  const getGenreData = () => {
    switch (genre) {
      case 'horror': return getHorrorData();
      case 'scifi': return getScifiData();
      case 'romance': return getRomanceData();
      default: return getFantasyData();
    }
  };
  
  const genreData = getGenreData();
  const location = genreData.locations[Math.floor(Math.random() * genreData.locations.length)];
  
  const nodes: BranchNode[] = [];
  
  // Personnaliser l'ouverture avec plus de contexte
  const openingTemplates = genreData.openings;
  const opening = openingTemplates[Math.floor(Math.random() * openingTemplates.length)];
  const personalizedOpening = `${opening} Votre voyage commence ici, et chaque choix déterminera votre destin dans cette aventure nommée "${adventureTitle}".`;

  // Premier nœud avec 3 choix initiaux différents
  const firstChoices = [
    `Explorer les mystères de ${location}`,
    "Chercher des alliés et des informations",
    "Se préparer et s'équiper pour le chemin"
  ];
  
  nodes.push({
    id: "root",
    text: personalizedOpening,
    choices: firstChoices.map((text, idx) => ({
      text,
      link: `node_0_${idx}`,
      consequences: ""
    }))
  });

  // Générer les événements avec variété
  for (let i = 0; i < nodeCount - 2; i++) {
    const eventTemplates = genreData.events;
    const eventText = eventTemplates[i % eventTemplates.length];
    
    // 3 choix différents à chaque nœud
    const choiceOptions = [
      ["Agir avec détermination", "Analyser la situation", "Chercher une solution pacifique"],
      ["Aller de l'avant", "Reculer et observer", "Demander de l'aide"],
      ["Prendre des risques", "Jouer la sécurité", "Créer une diversion"],
      ["Faire confiance à votre instinct", "Utiliser vos compétences", "Improviser"],
      ["Combattre", "Négocier", "Fuir stratégiquement"],
      ["Explorer les profondeurs", "Rester ensemble", "Diviser pour mieux régner"],
      ["Sacrifice personnel", "Sacrifice stratégique", "Tricher pour survivre"],
      ["Accepter l'aide d'un的神秘", "Refuser toute assistance", "Demander conseil aux anciens"]
    ];
    
    const choices = choiceOptions[i % choiceOptions.length].map((choiceText, idx) => ({
      text: choiceText,
      link: i < nodeCount - 3 ? `node_${i + 1}_${idx}` : `ending_${idx}`,
      consequences: ""
    }));

    nodes.push({
      id: `node_${i}`,
      text: eventText,
      choices,
      isEnd: false
    });
  }

  // Ajouter les fins (2-4 fins différentes)
  const endingCount = 2 + Math.floor(Math.random() * 3);
  const shuffledEndings = [...genreData.endings].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < endingCount; i++) {
    nodes.push({
      id: `ending_${i}`,
      text: shuffledEndings[i % shuffledEndings.length],
      choices: [],
      isEnd: true
    });
  }

  return nodes;
};

const GENRES: GenreInfo[] = [
  { key: "fantasy", title: "Fantasy", subtitle: "Royaumes, magie et quêtes héroïques", accent: "from-cyan-500 to-blue-500" },
  { key: "horror", title: "Horreur", subtitle: "Thriller, mystère et frissons", accent: "from-rose-500 to-red-500" },
  { key: "scifi", title: "Science-Fiction", subtitle: "Futur, espace et technologie", accent: "from-violet-500 to-cyan-500" },
  { key: "romance", title: "Romance", subtitle: "Amour, émotions et destins croisés", accent: "from-pink-500 to-rose-500" },
];

type GenreKey = "fantasy" | "horror" | "scifi" | "romance";

export default function AdventureEditor() {
  const router = useRouter();
  const { user } = useAuthContext();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<GenreKey>("fantasy");
  const [nodes, setNodes] = useState<BranchNode[]>([
    { id: "root", text: "", choices: [{ text: "", link: "", consequences: "" }] }
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState("root");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [currentGenreStep, setCurrentGenreStep] = useState(0);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Navigation carousel genre
  const totalGenreSteps = GENRES.length;
  const currentGenre = GENRES[currentGenreStep];

  const handlePreviousGenre = () => {
    if (currentGenreStep > 0) {
      setCurrentGenreStep(currentGenreStep - 1);
      setGenre(GENRES[currentGenreStep - 1].key as GenreKey);
    }
  };

  const handleNextGenre = () => {
    if (currentGenreStep < totalGenreSteps - 1) {
      setCurrentGenreStep(currentGenreStep + 1);
      setGenre(GENRES[currentGenreStep + 1].key as GenreKey);
    }
  };

  const handleGenreSelect = (genreKey: string) => {
    const index = GENRES.findIndex(g => g.key === genreKey);
    if (index !== -1) {
      setCurrentGenreStep(index);
      setGenre(genreKey as GenreKey);
    }
  };

  const generateWithAI = async () => {
    if (!title.trim()) {
      setError("Donnez d'abord un titre");
      return;
    }
    setGenerating(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const generatedNodes = generateAdventureContent(genre, title);
      setNodes(generatedNodes);
      setSelectedNodeId("root");
      setNotice("Aventure générée !");
      setTimeout(() => setNotice(null), 2000);
    } catch {
      setError("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const addNode = () => {
    const newId = `node_${Date.now()}`;
    const newNode: BranchNode = {
      id: newId,
      text: "",
      choices: [{ text: "", link: "", consequences: "" }]
    };
    setNodes([...nodes, newNode]);
    return newId;
  };

  const addChoice = () => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        return { ...node, choices: [...node.choices, { text: "", link: "", consequences: "" }] };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const removeChoice = (index: number) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId && node.choices.length > 1) {
        return { ...node, choices: node.choices.filter((_, i) => i !== index) };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const updateChoice = (index: number, field: keyof Choice, value: string) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        const newChoices = [...node.choices];
        newChoices[index] = { ...newChoices[index], [field]: value };
        return { ...node, choices: newChoices };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const createNodeFromChoice = (choiceIndex: number) => {
    const newNodeId = addNode();
    updateChoice(choiceIndex, "link", newNodeId);
    setSelectedNodeId(newNodeId);
  };

  const updateNodeText = (text: string) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        return { ...node, text };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const markAsEnd = () => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        return { ...node, isEnd: true, choices: [] };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const handleSave = async () => {
    if (!user || !title.trim() || !selectedNode.text.trim()) {
      setError("Titre et premier texte requis");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: adventure, error: advError } = await supabase
        .from("aventure")
        .insert({ titre: title, description, auteur_id: user.id })
        .select()
        .single();

      if (advError) throw advError;

      const nodeIdMap = new Map<string, number>();
      
      for (const node of nodes) {
        const isRoot = node.id === "root";
        const choicesText = node.choices.map(c => c.text);
        
        // Inclure le statChange dans les conséquences
        const choicesConsequences = node.choices.map(c => {
          let consequence = c.consequences || '';
          if (c.statChange) {
            const statChangeStr = Object.entries(c.statChange)
              .filter(([, v]) => v !== 0)
              .map(([k, v]) => `${k}:${v}`)
              .join(',');
            if (statChangeStr) {
              consequence = consequence ? `${consequence} | Stats: ${statChangeStr}` : `Stats: ${statChangeStr}`;
            }
          }
          return consequence;
        });

        const { data: branch, error: branchError } = await supabase
          .from("embranchement")
          .insert({
            texte: node.text,
            choix1: choicesText[0] || null,
            choix1_lien: null,
            choix1_consequences: choicesConsequences[0] || null,
            choix2: choicesText[1] || null,
            choix2_lien: null,
            choix2_consequences: choicesConsequences[1] || null,
            id_aventure: adventure.id,
          })
          .select()
          .single();

        if (branchError) throw branchError;
        
        nodeIdMap.set(node.id, branch.id);
        
        if (isRoot) {
          await supabase.from("aventure").update({ embranchement_initial_id: branch.id }).eq("id", adventure.id);
        }
      }

      for (const node of nodes) {
        const currentBranchId = nodeIdMap.get(node.id);
        if (!currentBranchId) continue;

        const updateData: Record<string, unknown> = {};
        
        if (node.choices[0]?.link) {
          const targetId = nodeIdMap.get(node.choices[0].link);
          if (targetId) updateData.choix1_lien = targetId;
        }
        if (node.choices[1]?.link) {
          const targetId = nodeIdMap.get(node.choices[1].link);
          if (targetId) updateData.choix2_lien = targetId;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase.from("embranchement").update(updateData).eq("id", currentBranchId);
        }
      }

      setNotice("Aventure créée ! Redirection...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0e1a] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="mt-6 text-3xl font-bold text-cyan-400 md:text-4xl">Création d&Aventure</h1>
        </div>

        {/* Carousel de sélection du genre */}
        <div className="mb-8">
          <div className="relative">
            {currentGenreStep > 0 && (
              <button
                onClick={handlePreviousGenre}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#1a2332]/90 hover:bg-cyan-600/50 hover:scale-110 rounded-full p-3 transition-all duration-200 active:scale-95"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="max-w-2xl mx-auto px-12 transition-all duration-300">
              <button
                onClick={() => handleGenreSelect(currentGenre.key)}
                className={`w-full p-6 rounded-2xl border transition-all ${
                  genre === currentGenre.key
                    ? `bg-gradient-to-r ${currentGenre.accent} text-white border-transparent shadow-lg`
                    : "bg-[#1a2332]/90 border-white/10 text-gray-300 hover:border-white/30"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{currentGenre.title}</h3>
                <p className="text-sm opacity-80">{currentGenre.subtitle}</p>
              </button>
            </div>

            {currentGenreStep < totalGenreSteps - 1 && (
              <button
                onClick={handleNextGenre}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#1a2332]/90 hover:bg-cyan-600/50 hover:scale-110 rounded-full p-3 transition-all duration-200 active:scale-95"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Indicateurs de progression */}
          <div className="flex justify-center gap-2 mt-6">
            {GENRES.map((_, index) => (
              <button
                key={index}
                onClick={() => handleGenreSelect(GENRES[index].key)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentGenreStep
                    ? `bg-cyan-400 w-8 shadow-lg shadow-cyan-400/30`
                    : "bg-gray-700 w-2 hover:bg-gray-500 hover:w-4"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#111827]/90 rounded-2xl border border-white/10 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Titre de l&apos;aventure</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre de votre aventure..."
                  className="w-full bg-[#0a0e1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  maxLength={80}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Une courte description..."
                  className="w-full h-24 bg-[#0a0e1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#111827]/90 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-cyan-400">
                  Noeud: {selectedNodeId === "root" ? "Début" : selectedNodeId.slice(0, 12)}
                  {selectedNode.isEnd && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">FIN</span>}
                </h2>
                <div className="flex gap-2">
                  {!selectedNode.isEnd && (
                    <button
                      onClick={markAsEnd}
                      className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                    >
                      Marquer comme fin
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Texte narratif</label>
                <textarea
                  value={selectedNode.text}
                  onChange={(e) => updateNodeText(e.target.value)}
                  placeholder="Décrivez ce qui se passe dans ce passage..."
                  className="w-full h-40 bg-[#0a0e1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {!selectedNode.isEnd && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Choix disponibles</label>
                    <button
                      onClick={addChoice}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter choix
                    </button>
                  </div>

                  {selectedNode.choices.map((choice, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(idx, "text", e.target.value)}
                          placeholder={`Choix ${idx + 1}`}
                          className="w-full bg-[#0a0e1a] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                        />
                        <div className="mt-2 flex gap-2 items-center">
                          <select
                            value={choice.link}
                            onChange={(e) => updateChoice(idx, "link", e.target.value)}
                            className="flex-1 bg-[#0a0e1a] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="">Sélectionner un noeud...</option>
                            {nodes.filter(n => n.id !== selectedNodeId).map(n => (
                              <option key={n.id} value={n.id}>
                                {n.id === "root" ? "Début" : n.id.slice(0, 15)} - {n.text.slice(0, 30)}...
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => createNodeFromChoice(idx)}
                            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                          >
                            + Nouveau
                          </button>
                        </div>
                        
                        {/* Effets sur les stats */}
                        <div className="mt-2 flex gap-2 items-center text-xs">
                          <span className="text-gray-500">Effets:</span>
                          {['force', 'agility', 'magie', 'endurance'].map(stat => (
                            <select
                              key={stat}
                              value={choice.statChange?.[stat as keyof typeof choice.statChange] ?? 0}
                              onChange={(e) => {
                                const updatedNodes = nodes.map(node => {
                                  if (node.id === selectedNodeId) {
                                    const newChoices = [...node.choices];
                                    const currentStatChange = newChoices[idx].statChange || {};
                                    newChoices[idx] = {
                                      ...newChoices[idx],
                                      statChange: {
                                        ...currentStatChange,
                                        [stat]: parseInt(e.target.value)
                                      }
                                    };
                                    return { ...node, choices: newChoices };
                                  }
                                  return node;
                                });
                                setNodes(updatedNodes);
                              }}
                              className={`bg-[#0a0e1a] border rounded px-2 py-1 text-white focus:border-cyan-500 focus:outline-none ${
                                (choice.statChange?.[stat as keyof typeof choice.statChange] ?? 0) > 0 ? 'border-green-500' :
                                (choice.statChange?.[stat as keyof typeof choice.statChange] ?? 0) < 0 ? 'border-red-500' : 'border-gray-700'
                              }`}
                            >
                              <option value={0}>{stat === 'magie' ? 'Magie' : stat.charAt(0).toUpperCase() + stat.slice(1)}: 0</option>
                              <option value={-3}>{stat === 'magie' ? 'Magie' : stat.charAt(0).toUpperCase() + stat.slice(1)}: -3</option>
                              <option value={-2}>{stat === 'magie' ? 'Magie' : stat.charAt(0).toUpperCase() + stat.slice(1)}: -2</option>
                              <option value={-1}>{stat === 'magie' ? 'Magie' : stat.charAt(0).toUpperCase() + stat.slice(1)}: -1</option>
                              <option value={1}>{stat === 'magie' ? 'Magie' : stat.charAt(0).toUpperCase() + stat.slice(1)}: +1</option>
                              <option value={2}>{stat === 'magie' ? 'Magie' : stat.charAt(0).toUpperCase() + stat.slice(1)}: +2</option>
                              <option value={3}>{stat === 'magie' ? 'Magie' : stat.charAt(0).toUpperCase() + stat.slice(1)}: +3</option>
                            </select>
                          ))}
                        </div>
                      </div>
                      {selectedNode.choices.length > 1 && (
                        <button
                          onClick={() => removeChoice(idx)}
                          className="p-2 text-gray-500 hover:text-red-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateWithAI}
                disabled={generating}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 font-medium disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                {generating ? "Génération..." : "Générer avec IA"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-400 hover:to-blue-400 font-medium disabled:opacity-50"
              >
                {saving ? "Publication..." : "Publier"}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/60 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            {notice && (
              <div className="p-3 bg-green-500/10 border border-green-500/60 rounded-lg text-green-300 text-sm">
                {notice}
              </div>
            )}
          </div>

          <div className="bg-[#111827]/90 rounded-2xl border border-white/10 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Noeuds ({nodes.length})</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {nodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedNodeId === node.id
                      ? "bg-cyan-500/20 border border-cyan-500/50"
                      : "bg-gray-800/50 border border-transparent hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono text-xs">
                      {node.id === "root" ? "START" : node.id.slice(0, 8)}
                    </span>
                    {node.isEnd && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">FIN</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1 truncate">
                    {node.text || "(texte vide)"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {node.choices.length} choix
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}