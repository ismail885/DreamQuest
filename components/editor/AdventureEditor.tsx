"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";

interface Choice {
  text: string;
  link: string; // ID du nœud cible (vide = créer nouveau nœud)
  consequences: string;
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

// Génération de contenu plus sophistiquée
const generateAdventureContent = (genre: string, title: string): BranchNode[] => {
  const structures: Record<string, {
    opening: string;
    events: Array<{ text: string; choices: string[] }>;
    endings: string[];
  }> = {
    fantasy: {
      opening: `Vous vous réveillez dans un monde où la magie et le danger coexistent. Une quête vous attend, et le destin du royaume repose entre vos mains.`,
      events: [
        {
          text: "Vous arrivez à la croisée des chemins. Un panneau indique trois destinations : la Forêt des Murmures à l'est, les Ruines Ancestrales au nord, et le Village des Artisans au sud.",
          choices: ["Se diriger vers la forêt", "Explorer les ruines", "Aller au village"]
        },
        {
          text: "Un vieil homme barbu vous aborde. Il semble posséder une connaissance antique.",
          choices: ["Lui parler", "L'ignorer", "Lui demander des informations"]
        },
        {
          text: "Vous trouvez un artefact mystérieux pulsant d'une énergie étrange.",
          choices: ["Le prendre", "L'examiner de loin", "Le laisser"]
        },
        {
          text: "Un groupe de bandits bloque votre chemin. Leur chef vous défie.",
          choices: ["Combattre", "Négocier", "Essayer de fuir"]
        }
      ],
      endings: [
"Vous avez complète votre quête et devenez une légende du royaume.",
    "Le chemin fut long mais vous avez trouvé votre place dans ce monde.",
    "Malgré les difficultés, vous avez réussi."
      ]
    },
    horror: {
      opening: "La brume épaisse enveloppe les rues désertes. Quelque chose de mauvais rôde dans l'ombre. Votre curiosité pourrait bien être votre dernière erreur.",
      events: [
        {
          text: "Vous trouvez une porte entrouverte qui n'était pas là hier. Une voix vous appelle depuis les ténèbres.",
          choices: ["Entrer", "Appeler à l'aide", "Courir"]
        },
        {
          text: "Un journal ancien révèle des secrets choquants sur la ville.",
          choices: ["Le lire", "Le brûler", "Le garder"]
        },
        {
          text: "Des pas se font entendre derrière vous. Quelqu'un - ou quelque chose - vous suit.",
          choices: ["Se retourner", "Se cacher", "Accélérer"]
        },
        {
          text: "Vous thérapeut une pièce pleine de symboles étranges. Au centre, un miroir reflète... autre chose que votre réflexion.",
          choices: ["Regarder dans le miroir", "Sortir immédiatement", "Examinez les symboles"]
        }
      ],
      endings: [
        "Vous avez survécu à la nuit. Mais savez-vous vraiment ce qui vous a échappé ?",
        "La vérité était trop horrible. Certaines choses ne devraient jamais être découvertes.",
        "Vous êtes devenu ce que vous chassiez."
      ]
    },
    scifi: {
      opening: "Année 2347. L'humanité a colonisé les étoiles, mais certains mystères restent irrésolus. Votre dernière mission pourrait tout changer.",
      events: [
        {
          text: "Le signal provenait d'une planète non cartographiée. Votre scanner détecte une structure artificielle.",
          choices: ["Atterrir", "Envoyer un drone", "Analyser à distance"]
        },
        {
          text: "L'IA du vaisseau vous alerte : 'Inconnu détecté. Probabilité de menace : 87%'.",
          choices: ["Armer les systèmes", "Tenter la communication", "Fuir"]
        },
        {
          text: "Vous trouvez un laboratoire abandonné avec des expériences inachevées.",
          choices: ["Activer les machines", "Collecter des données", "Tout détruire"]
        },
        {
          text: "Un alien vous fait signe. Son expression semble... pacifique ?",
          choices: ["Répondre au geste", "Rester sur vos gardes", "Demander de l'aide"]
        }
      ],
      endings: [
        "Vous avez changé le cours de l'histoire humaine.",
        "La vérité sur l'univers n'était pas prête à être révélée.",
        "Votre sacrifice sera mémorisé par les générations futures."
      ]
    },
    romance: {
      opening: "Dans une ville où les destins se croisent, deux âmes sont sur le point de se trouver. L'amour ne suit jamais un chemin prévisible.",
      events: [
        {
          text: "Un marché animé. Quelque chose attire votre regard - une personne inattendue.",
          choices: ["L'aborder", "L'observer", "Passer votre chemin"]
        },
        {
          text: "La pluie commence à tomber. Un abri se présente, mais vous n'êtes pas seul.",
          choices: ["Demander à se joindre", "Attendre à l'extérieur", "Partir sous la pluie"]
        },
        {
          text: "Un événement important approche. Vous pourriez invités cette personne.",
          choices: ["Inviter formellement", "Proposer quelque chose de différent", "Ne pas insister"]
        },
        {
          text: "Un malentendu menace de tout gâcher. Comment allez-vous réagir ?",
          choices: ["Expliquer calmement", "Laisser du temps", "Insister pour s'expliquer"]
        }
      ],
      endings: [
"Votre histoire commence à peine.",
    " Certains amour durent éternellement.",
    "Ensemble, vous avez trouvé ce que vous cherchiez."
      ]
    }
  };

  const structure = structures[genre] || structures.fantasy;
  
  // Créer les nœuds de l'aventure
  const nodes: BranchNode[] = [];
  
  // Nœud initial (racine)
  nodes.push({
    id: "root",
    text: structure.opening,
    choices: [
      { text: structure.events[0].choices[0], link: "node_1", consequences: "" },
      { text: structure.events[0].choices[1], link: "node_2", consequences: "" },
      { text: structure.events[0].choices[2], link: "node_3", consequences: "" }
    ]
  });

  // Créer les nœuds événementiels
  for (let i = 1; i < structure.events.length; i++) {
    const event = structure.events[i];
    const choiceCount = 2 + Math.floor(Math.random() * 2); // 2-3 choix
    
    const choices: Choice[] = [];
    for (let j = 0; j < Math.min(choiceCount, event.choices.length); j++) {
      const nextNodeId = i < structure.events.length - 1 ? `node_${i + 1}_${j}` : `ending_${i}`;
      choices.push({
        text: event.choices[j],
        link: nextNodeId,
        consequences: ""
      });
    }

    nodes.push({
      id: `node_${i}`,
      text: event.text,
      choices,
      isEnd: false
    });
  }

  // Ajouter les fins
  structure.endings.forEach((ending, idx) => {
    nodes.push({
      id: `ending_${idx}`,
      text: ending,
      choices: [],
      isEnd: true
    });
  });

  return nodes;
};

// Métadonnées de genre
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
  
  // État de l'aventure
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<GenreKey>("fantasy");
  
  // État des nœuds (arbre narratif)
  const [nodes, setNodes] = useState<BranchNode[]>([
    { id: "root", text: "", choices: [{ text: "", link: "", consequences: "" }] }
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState("root");
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showTreeView, setShowTreeView] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Charger le brouillon au démarrage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`dq_draft_${user.id}`);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setNodes(draft.nodes || [{ id: "root", text: "", choices: [{ text: "", link: "", consequences: "" }] }]);
        if (draft.genre) setGenre(draft.genre as GenreKey);
      } catch {}
    }
  }, [user]);

  // Générer une aventure complète avec l'IA
  const generateWithAI = async () => {
    if (!title.trim()) {
      setError("Donnez d'abord un titre");
      return;
    }
    setGenerating(true);
    setError(null);

    try {
      // Simulation de génération IA (ici on utilise les templates structurés)
      // Dans une vraie implémentation, on appellerait une API comme OpenAI
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simuler le délai API
      
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

  // Ajouter un nouveau nœud
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

  // Ajouter un choix au nœud actuel
  const addChoice = () => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          choices: [...node.choices, { text: "", link: "", consequences: "" }]
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  // Retirer un choix
  const removeChoice = (index: number) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId && node.choices.length > 1) {
        return {
          ...node,
          choices: node.choices.filter((_, i) => i !== index)
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  // Mettre à jour un choix
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

  // Créer un nouveau nœud à partir d'un choix
  const createNodeFromChoice = (choiceIndex: number) => {
    const newNodeId = addNode();
    updateChoice(choiceIndex, "link", newNodeId);
    setSelectedNodeId(newNodeId);
  };

  // Mettre à jour le texte du nœud
  const updateNodeText = (text: string) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        return { ...node, text };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  // Marquer comme fin
  const markAsEnd = () => {
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        return { ...node, isEnd: true, choices: [] };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  // Enregistrer le brouillon
  const saveDraft = () => {
    if (!user || !title.trim()) {
      setError("Titre requis");
      return;
    }
    try {
      const draft = { id: `draft_${Date.now()}`, title, description, genre, nodes, savedAt: new Date().toISOString() };
      localStorage.setItem(`dq_draft_${user.id}`, JSON.stringify(draft));
      setNotice("Brouillon enregistré");
      setTimeout(() => setNotice(null), 2000);
    } catch {
      setError("Erreur lors de la sauvegarde");
    }
  };

  // Sauvegarder en base de données
  const handleSave = async () => {
    if (!user || !title.trim() || !selectedNode.text.trim()) {
      setError("Titre et premier texte requis");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Créer l'aventure
      const { data: adventure, error: advError } = await supabase
        .from("aventure")
        .insert({ titre: title, description, auteur_id: user.id })
        .select()
        .single();

      if (advError) throw advError;

      // 2. Créer tous les nœuds (embranchements)
      const nodeIdMap = new Map<string, number>(); // Ancien ID -> nouveau ID
      
      for (const node of nodes) {
        const isRoot = node.id === "root";
        const choicesText = node.choices.map(c => c.text);
        const choicesLinks = node.choices.map(c => c.link);
        const choicesConsequences = node.choices.map(c => c.consequences);

        const { data: branch, error: branchError } = await supabase
          .from("embranchement")
          .insert({
            texte: node.text,
            choix1: choicesText[0] || null,
            choix1_lien: null, // On met à jour après
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

      // 3. Mettre à jour les liens entre nœuds
      for (const node of nodes) {
        const currentBranchId = nodeIdMap.get(node.id);
        if (!currentBranchId) continue;

        // Mettre à jour les choix avec les vrais IDs
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

      // Nettoyer le brouillon
      localStorage.removeItem(`dq_draft_${user.id}`);

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
        {/* Header */}
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
          <h1 className="mt-6 text-3xl font-bold text-cyan-400 md:text-4xl">Editeur d&apos;Aventure</h1>
        </div>

        {/* Sélecteur de genre */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {GENRES.map((g) => (
              <button
                key={g.key}
                onClick={() => setGenre(g.key as GenreKey)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all ${
                  genre === g.key
                    ? `bg-gradient-to-r ${g.accent} text-white shadow-lg`
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne gauche: Éditeur de nœud */}
          <div className="lg:col-span-2 space-y-4">
            {/* Titre et description */}
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

            {/* Éditeur de nœud */}
            <div className="bg-[#111827]/90 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-cyan-400">
                  Nœud: {selectedNodeId === "root" ? "Début" : selectedNodeId.slice(0, 12)}
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

              {/* Texte du nœud */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Texte narratif</label>
                <textarea
                  value={selectedNode.text}
                  onChange={(e) => updateNodeText(e.target.value)}
                  placeholder="Décrivez ce qui se passe dans ce passage..."
                  className="w-full h-40 bg-[#0a0e1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Choix */}
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
                            <option value="">Sélectionner un nœud...</option>
                            {nodes.filter(n => n.id !== selectedNodeId).map(n => (
                              <option key={n.id} value={n.id}>
                                {n.id === "root" ? "Début" : n.id.slice(0, 15)} - {n.text.slice(0, 30)}...
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => createNodeFromChoice(idx)}
                            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                            title="Créer nouveau nœud"
                          >
                            + Nouveau
                          </button>
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

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateWithAI}
                disabled={generating}
                className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-xl hover:bg-purple-500/30 font-medium disabled:opacity-50"
              >
                {generating ? "Génération..." : "✨ Générer avec IA"}
              </button>
              <button
                onClick={saveDraft}
                className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-xl hover:bg-yellow-500/30 font-medium"
              >
                Sauver brouillon
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

          {/* Colonne droite: Liste des nœuds */}
          <div className="bg-[#111827]/90 rounded-2xl border border-white/10 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Nodes ({nodes.length})</h3>
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