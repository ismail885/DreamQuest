"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import { generateAdventure } from "@/lib/generator/engine";
import { ChevronLeft, ChevronRight, AlertCircle, Check, Wand2, Plus } from "lucide-react";

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
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [duree_estimee, setDuree_estimee] = useState(0);
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
      const generated = generateAdventure({ title, genre });
      const adaptedNodes: BranchNode[] = generated.nodes.map(node => ({
        id: node.id,
        text: node.text,
        choices: node.choices.map(c => ({
          text: c.text || "",
          link: c.link || "",
          consequences: c.consequences || "",
        })),
        isEnd: node.isEnd,
      }));
      setNodes(adaptedNodes);
      setDescription(generated.description);
      setDifficulty(generated.difficulty);
      setDuree_estimee(generated.duree_estimee);
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
        .insert({ 
          titre: title, 
          description, 
          difficulty,
          duree_estimee,
          genre,
          auteur_id: user.id 
        })
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
   } catch {
   setError("Erreur lors de la sauvegarde");
   } finally {
   setSaving(false);
   }
 };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 max-w-5xl mx-auto w-full">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Retour
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3b9ede] mt-2">
          Création d&apos;Aventure
        </h1>
      </div>

      {/* Carte principale */}
      <div className="flex-1 px-4 pb-8 max-w-6xl mx-auto w-full">
        <div className="bg-[#131e35] rounded-2xl p-6 md:p-10 border border-gray-800/50 space-y-6">
          
          {/* Sélection du genre */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Sélectionnez un genre</h2>
            <div className="relative">
              {currentGenreStep > 0 && (
                <button
                  onClick={handlePreviousGenre}
                  disabled={currentGenreStep === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#141d2e]/90 hover:bg-cyan-600/50 disabled:opacity-30 flex items-center justify-center transition-all border border-gray-700/50 hover:border-cyan-500/50"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}

              <div className="max-w-2xl mx-auto px-12">
                <button
                  onClick={() => handleGenreSelect(currentGenre.key)}
                  className={`w-full p-6 rounded-2xl border transition-all ${
                    genre === currentGenre.key
                      ? `bg-gradient-to-r ${currentGenre.accent} text-white border-transparent shadow-lg`
                      : "bg-[#141d2e]/90 border-white/10 text-gray-300 hover:border-white/30"
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-2">{currentGenre.title}</h3>
                  <p className="text-sm opacity-80">{currentGenre.subtitle}</p>
                </button>
              </div>

              {currentGenreStep < totalGenreSteps - 1 && (
                <button
                  onClick={handleNextGenre}
                  disabled={currentGenreStep === totalGenreSteps - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#141d2e]/90 hover:bg-cyan-600/50 disabled:opacity-30 flex items-center justify-center transition-all border border-gray-700/50 hover:border-cyan-500/50"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
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
                      ? "bg-cyan-400 w-6 shadow-lg shadow-cyan-400/30"
                      : "bg-gray-700 w-2 hover:bg-gray-500 hover:w-3"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-800/50" />

          {/* Infos de l'aventure */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Informations</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-gray-300 text-sm mb-2 font-medium">
                  Titre de l&apos;aventure
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre..."
                  maxLength={80}
                  className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${title.length >= 75 ? "text-amber-400" : "text-gray-500"}`}>
                    {title.length}/80
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-gray-300 text-sm mb-2 font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Une courte description de votre aventure..."
                  className="w-full h-24 px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="difficulty" className="block text-gray-300 text-sm mb-2 font-medium">
                    Difficulté
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "easy" | "normal" | "hard")}
                    className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
                  >
                    <option value="easy">Facile</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duree" className="block text-gray-300 text-sm mb-2 font-medium">
                    Durée estimée (min)
                  </label>
                  <input
                    id="duree"
                    type="number"
                    value={duree_estimee}
                    onChange={(e) => setDuree_estimee(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {notice && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  {notice}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={generateWithAI}
                  disabled={!title.trim() || generating}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  {generating ? "Génération..." : "Générer avec IA"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || saving}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 disabled:shadow-none text-sm"
                >
                  {saving ? "Publication..." : "Publier"}
                </button>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-800/50" />

          {/* Éditeur de nœuds */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-white">Éditeur de nœud</h2>
              <div className="bg-[#141d2e]/50 rounded-lg p-4 border border-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-cyan-400">
                    Nœud: {selectedNodeId === "root" ? "Début" : selectedNodeId.slice(0, 12)}
                    {selectedNode.isEnd && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">FIN</span>}
                  </span>
                  {!selectedNode.isEnd && (
                    <button
                      onClick={markAsEnd}
                      className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
                    >
                      Marquer comme fin
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor="nodeText" className="block text-gray-300 text-xs mb-2 font-medium">
                    Texte narratif
                  </label>
                  <textarea
                    id="nodeText"
                    value={selectedNode.text}
                    onChange={(e) => updateNodeText(e.target.value)}
                    placeholder="Décrivez ce qui se passe..."
                    className="w-full h-32 px-3 py-2 bg-[#0d1117] border border-gray-700 rounded text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 text-sm resize-none"
                  />
                </div>
              </div>

              {!selectedNode.isEnd && (
                <div className="bg-[#141d2e]/50 rounded-lg p-4 border border-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-cyan-400">Choix disponibles</span>
                    <button
                      onClick={addChoice}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedNode.choices.map((choice, idx) => (
                      <div key={idx} className="space-y-2 p-3 bg-[#0d1117] rounded border border-gray-700">
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(idx, "text", e.target.value)}
                          placeholder={`Choix ${idx + 1}`}
                          className="w-full bg-[#121827] border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
                        />

                        <select
                          value={choice.link}
                          onChange={(e) => updateChoice(idx, "link", e.target.value)}
                          className="w-full bg-[#121827] border border-gray-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none text-sm"
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
                          className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                        >
                          + Nouveau nœud
                        </button>

                        {selectedNode.choices.length > 1 && (
                          <button
                            onClick={() => removeChoice(idx)}
                            className="w-full text-xs p-1 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            Supprimer ce choix
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite : List des nœuds */}
            <div className="bg-[#141d2e]/50 rounded-lg p-4 border border-gray-800/50 h-fit">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">Nœuds ({nodes.length})</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {nodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full text-left p-2 rounded text-sm transition-all ${
                      selectedNodeId === node.id
                        ? "bg-cyan-500/20 border border-cyan-500/50"
                        : "bg-gray-800/30 border border-transparent hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-mono text-xs">
                        {node.id === "root" ? "START" : `N${nodes.indexOf(node)}`}
                      </span>
                      {node.isEnd && <span className="text-xs bg-green-500/20 text-green-400 px-1 py-0.5 rounded">FIN</span>}
                    </div>
                    <p className="text-gray-400 text-xs mt-1 truncate">{node.text || "(vide)"}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   );
}

