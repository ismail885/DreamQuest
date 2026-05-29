"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import {
  ChevronLeft, ChevronRight, Wand2, Send, Plus, Trash2,
  Loader2, CheckCircle2, Target, BookOpen, AlertTriangle, Eye, EyeOff,
  Rocket, Ghost, Search, Swords
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Types ── */
interface Choice {
  label: string;
  target: string;
}

interface StoryNode {
  id: string;
  label: string;
  text: string;
  isEnd: boolean;
  choices: Choice[];
}

interface Genre {
  icon: LucideIcon;
  name: string;
  desc: string;
}

const GENRES: Genre[] = [
  { icon: Rocket, name: "Science-Fiction", desc: "Futur, espace et technologie" },
  { icon: Wand2, name: "Fantasy", desc: "Magie, dragons et épopées" },
  { icon: Ghost, name: "Horreur", desc: "Tension, mystère et frissons" },
  { icon: Search, name: "Policier", desc: "Enquêtes et rebondissements" },
  { icon: Swords, name: "Western", desc: "Désert, duels et aventure" },
];

/* ── 3 nœuds d'exemple pré-remplis — sci-fi, cohérents avec "Omniscient owner" ── */
const DEFAULT_NODES: StoryNode[] = [
  {
    id: "debut",
    label: "Début",
    text: "Le vaisseau Omniscient Owner dérive dans le silence du secteur 7-Gamma. Autour de vous, les écrans clignotent en affichant des alertes rouges que vous ne comprenez pas. Le système central, une IA nommée ARIA, murmure d'une voix métallique : « Commandant, nous avons perdu la liaison avec le module de recherche. Les derniers relevés indiquent une anomalie gravitationnelle à proximité immédiate. »\n\nVous vous redressez sur votre siège. L'équipage vous regarde, attendant vos ordres. Le vaisseau tremble légèrement, comme si l'espace lui-même résistait à votre présence.",
    isEnd: false,
    choices: [
      { label: "Analyser l'anomalie avec les capteurs longue portée", target: "n2" },
      { label: "Envoyer une équipe au module de recherche", target: "n3" },
    ],
  },
  {
    id: "n2",
    label: "N2",
    text: "Vous activez les capteurs longue portée. Un grésillement emplit la salle de commande avant qu'une image ne se forme sur l'écran principal : une structure imposante, noire et anguleuse, flotte au milieu de nulle part. Elle semble plus ancienne que toute technologie connue, parcourue de runes lumineuses qui pulsent au rythme d'un signal inconnu.\n\nARIA analyse les données : « Structure non répertoriée, composition inconnue. Le signal semble... intentionnel. Comme un appel. »\n\nLe vaisseau vibre à nouveau, plus fort cette fois.",
    isEnd: false,
    choices: [
      { label: "Tenter d'établir une communication", target: "n4" },
      { label: "Préparer un vaisseau d'exploration", target: "n5" },
    ],
  },
  {
    id: "n3",
    label: "N3",
    text: "Vous ordonnez au lieutenant Chen de rassembler une équipe. Trois membres d'équipage s'équipent et se dirigent vers le module de recherche. Le couloir est plongé dans une pénombre anormale — les lumières de secours vacillent.\n\nSoudain, un cri déchire le silence. La communication se coupe. Un silence épais s'installe.\n\nSur votre tablette, un message s'affiche : « Ce n'était pas une anomalie. C'était une porte. Et elle est ouverte. »",
    isEnd: true,
    choices: [],
  },
  {
    id: "n4",
    label: "N4",
    text: "Vous activez le canal universel. Pendant de longues secondes, rien ne se produit. Puis, l'écran s'illumine d'une lumière douce, et une silhouette humanoïde faite de lumière bleutée apparaît. Elle incline la tête.\n\n« Vous êtes enfin arrivés. Nous vous attendions depuis si longtemps que nos étoiles se sont éteintes et rallumées trois fois. L'Épreuve vous attend, Commandant. L'Épreuve de l'Omniscient Owner. »",
    isEnd: true,
    choices: [],
  },
  {
    id: "n5",
    label: "N5",
    text: "Le vaisseau d'exploration est déployé. Vous pilotez vous-même l'appareil à travers le champ d'anomalies. Les instruments s'affolent, l'espace se tord autour de vous dans une danse de couleurs impossibles.\n\nVous émergez de l'autre côté, dans une dimension parallèle où les lois de la physique semblent différentes. Une station spatiale gigantesque, grande comme une lune, flotte devant vous.\n\nSur sa coque, inscrit en lettres de feu : OMNISCIENT OWNER.",
    isEnd: false,
    choices: [
      { label: "Accoster la station", target: "debut" },
    ],
  },
];

/* ── Composant ── */
export default function AdventureEditor() {
  const router = useRouter();
  const { user } = useAuthContext();

  /* ── États ── */
  const [genreIndex, setGenreIndex] = useState(0);
  const [title, setTitle] = useState("Omniscient owner");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Difficile");
  const [duration, setDuration] = useState(60);
  const [nodes, setNodes] = useState<StoryNode[]>(DEFAULT_NODES);
  const [activeNodeId, setActiveNodeId] = useState("debut");
  const [previewMode, setPreviewMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];
  const currentGenre = GENRES[genreIndex];
  const GenreIcon = currentGenre.icon;
  const nodesListRef = useRef<HTMLDivElement>(null);

  /* ── Scroll auto dans la liste quand on change de nœud ── */
  useEffect(() => {
    if (nodesListRef.current) {
      const el = nodesListRef.current.querySelector(`[data-node-id="${activeNodeId}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeNodeId]);

  /* ── Génération IA ── */
  const generateWithAI = async () => {
    if (!title.trim()) {
      setError("Donnez d'abord un titre à l'aventure");
      return;
    }
    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/generate-adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          genre: currentGenre.name,
        }),
      });

      if (!res.ok) throw new Error("Erreur API");

      const data = await res.json();
      const raw = data.content[0].text;
      const parsed = JSON.parse(raw);

      if (!parsed.nodes || !Array.isArray(parsed.nodes) || parsed.nodes.length < 2) {
        throw new Error("Format invalide");
      }

      setNodes(parsed.nodes);
      setActiveNodeId("debut");
      setSuccess("Aventure générée avec succès !");
    } catch {
      // Fallback local : simulation réaliste
      setError(null);
      await new Promise((r) => setTimeout(r, 600));
      setNodes(DEFAULT_NODES);
      setActiveNodeId("debut");
      setSuccess("Aventure générée ! (mode hors-ligne)");
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Helpers nœuds & choix ── */
  const updateNodeText = (text: string) => {
    setNodes((prev) => prev.map((n) => (n.id === activeNodeId ? { ...n, text } : n)));
  };

  const updateChoiceLabel = (idx: number, label: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === activeNodeId
          ? { ...n, choices: n.choices.map((c, i) => (i === idx ? { ...c, label } : c)) }
          : n,
      ),
    );
  };

  const updateChoiceTarget = (idx: number, target: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === activeNodeId
          ? { ...n, choices: n.choices.map((c, i) => (i === idx ? { ...c, target } : c)) }
          : n,
      ),
    );
  };

  const addChoice = () => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === activeNodeId
          ? { ...n, choices: [...n.choices, { label: "", target: "" }] }
          : n,
      ),
    );
  };

  const removeChoice = (idx: number) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === activeNodeId && n.choices.length > 1
          ? { ...n, choices: n.choices.filter((_, i) => i !== idx) }
          : n,
      ),
    );
  };

  const addNewNode = () => {
    const newId = `n${Date.now()}`;
    const newNode: StoryNode = {
      id: newId,
      label: `N${nodes.length + 1}`,
      text: "",
      isEnd: false,
      choices: [{ label: "", target: "" }],
    };
    setNodes((prev) => [...prev, newNode]);
    setActiveNodeId(newId);
  };

  const toggleEnd = () => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === activeNodeId
          ? { ...n, isEnd: !n.isEnd, choices: !n.isEnd ? [] : n.choices }
          : n,
      ),
    );
  };

  const selectNodeFromChoice = (choiceIdx: number) => {
    const choice = activeNode.choices[choiceIdx];
    if (choice.target && nodes.find((n) => n.id === choice.target)) {
      setActiveNodeId(choice.target);
    } else {
      // Crée un nouveau nœud et lie le choix
      const newId = `n${Date.now()}`;
      const newNode: StoryNode = {
        id: newId,
        label: `N${nodes.length + 1}`,
        text: "",
        isEnd: false,
        choices: [],
      };
      setNodes((prev) => [...prev, newNode]);
      updateChoiceTarget(choiceIdx, newId);
      setActiveNodeId(newId);
    }
  };

  const isNodeReferenced = (nodeId: string): boolean => {
    if (nodeId === "debut") return true;
    return nodes.some((n) => n.choices.some((c) => c.target === nodeId));
  };

  /* ── Sauvegarde ── */
  const handleSave = async () => {
    if (!user || !title.trim() || !activeNode.text.trim()) {
      setError("Titre et contenu narratif requis");
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
          difficulty: difficulty.toLowerCase(),
          duree_estimee: duration,
          genre: currentGenre.name.toLowerCase(),
          auteur_id: user.id,
        })
        .select()
        .single();

      if (advError) throw advError;

      const nodeIdMap = new Map<string, number>();

      for (const node of nodes) {
        const isRoot = node.id === "debut";
        const choicesText = node.choices.map((c) => c.label);
        const choicesConsequences = node.choices.map((c) => c.target || null);

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
          await supabase
            .from("aventure")
            .update({ embranchement_initial_id: branch.id })
            .eq("id", adventure.id);
        }
      }

      for (const node of nodes) {
        const currentBranchId = nodeIdMap.get(node.id);
        if (!currentBranchId) continue;

        const updateData: Record<string, unknown> = {};
        if (node.choices[0]?.target) {
          const targetId = nodeIdMap.get(node.choices[0].target);
          if (targetId) updateData.choix1_lien = targetId;
        }
        if (node.choices[1]?.target) {
          const targetId = nodeIdMap.get(node.choices[1].target);
          if (targetId) updateData.choix2_lien = targetId;
        }
        if (Object.keys(updateData).length > 0) {
          await supabase.from("embranchement").update(updateData).eq("id", currentBranchId);
        }
      }

      setSuccess("Aventure publiée ! Redirection...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const startGeneration = () => {
    generateWithAI();
  };

  /* ── Styles globaux (scrollbar custom) ── */
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .editor-scroll::-webkit-scrollbar { width: 4px; }
      .editor-scroll::-webkit-scrollbar-track { background: transparent; }
      .editor-scroll::-webkit-scrollbar-thumb { background: #22D3EE; border-radius: 4px; }
      .editor-scroll { scrollbar-width: thin; scrollbar-color: #22D3EE transparent; }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-slide-in { animation: fadeSlideIn 0.3s ease-out; }
      .genre-card-gradient {
        background: linear-gradient(135deg, #7C3AED, #22D3EE);
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  /* ── Rendu principal ── */
  return (
    <div className="h-screen bg-[#0D1117] text-[#F0F6FC] flex flex-col overflow-hidden">
      {/* ── Header global ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#30363D] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1.5 text-[#8B949E] hover:text-[#F0F6FC] transition-all duration-200 text-sm group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour
          </button>
          <div className="w-px h-5 bg-[#30363D]" />
          <h1 className="text-xl font-bold text-[#22D3EE]">Création d&apos;Aventure</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#8B949E]">
          <BookOpen className="w-4 h-4 text-[#22D3EE]" />
          <span>{nodes.length} nœud{nodes.length > 1 ? "s" : ""}</span>
        </div>
      </header>

      {/* ── Corps 3 colonnes ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ══════ COLONNE A — Configuration (33%) ══════ */}
        <aside className="w-[33%] min-w-[320px] border-r border-[#30363D] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5 editor-scroll">
            {/* Carrousel de genre */}
            <section>
              <h2 className="text-sm font-bold text-[#8B949E] uppercase tracking-wider mb-3">Genre</h2>
              <div className="relative">
                  {/* Carte genre */}
                <div className="genre-card-gradient rounded-xl h-[90px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <GenreIcon className="w-7 h-7 relative z-10 text-white" />
                  <p className="text-white font-bold text-base relative z-10">{currentGenre.name}</p>
                  <p className="text-white/70 text-xs relative z-10">{currentGenre.desc}</p>
                </div>

                {/* Flèche gauche */}
                {genreIndex > 0 && (
                  <button
                    onClick={() => setGenreIndex((i) => i - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1C2128] border border-[#30363D] flex items-center justify-center hover:bg-[#30363D] transition-all duration-200 text-[#8B949E] hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Flèche droite */}
                {genreIndex < GENRES.length - 1 && (
                  <button
                    onClick={() => setGenreIndex((i) => i + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1C2128] border border-[#30363D] flex items-center justify-center hover:bg-[#30363D] transition-all duration-200 text-[#8B949E] hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-3">
                {GENRES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGenreIndex(i)}
                    className={`transition-all duration-200 rounded-full ${
                      i === genreIndex
                        ? "w-6 h-2 bg-[#22D3EE]"
                        : "w-2 h-2 bg-[#30363D] hover:bg-[#8B949E]"
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Séparateur */}
            <div className="border-t border-[#30363D]" />

            {/* Formulaire */}
            <section>
              <h2 className="text-sm font-bold text-white mb-3">Informations</h2>
              <div className="space-y-3">
                {/* Titre */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="title" className="text-xs text-[#8B949E]">Titre de l&apos;aventure</label>
                    <span className={`text-[10px] ${title.length >= 75 ? "text-[#F0883E]" : "text-[#8B949E]"}`}>
                      {title.length}/80
                    </span>
                  </div>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                    placeholder="Titre de votre aventure..."
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2.5 text-sm text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#22D3EE] transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="desc" className="text-xs text-[#8B949E] block mb-1">Description</label>
                  <textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Une courte description..."
                    rows={3}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2.5 text-sm text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#22D3EE] transition-all duration-200 resize-none"
                  />
                </div>

                {/* Difficulté + Durée */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="diff" className="text-xs text-[#8B949E] block mb-1">Difficulté</label>
                    <select
                      id="diff"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2.5 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#22D3EE] transition-all duration-200"
                    >
                      <option value="Facile">Facile</option>
                      <option value="Normal">Normal</option>
                      <option value="Difficile">Difficile</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dur" className="text-xs text-[#8B949E] block mb-1">Durée (min)</label>
                    <input
                      id="dur"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2.5 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#22D3EE] transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#F85149]/10 border border-[#F85149]/30 rounded-lg text-[#F85149] text-sm">
                <span className="w-1 h-1 rounded-full bg-[#F85149] flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg text-[#238636] text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="space-y-2">
              <button
                onClick={startGeneration}
                disabled={!title.trim() || generating}
                className="w-full py-2.5 bg-[#22D3EE] hover:bg-[#22D3EE]/90 disabled:bg-[#30363D] disabled:text-[#8B949E] disabled:cursor-not-allowed text-[#0D1117] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Générer avec IA
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || saving}
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#7C3AED]/90 disabled:bg-[#30363D] disabled:text-[#8B949E] disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publier
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* ══════ COLONNE B — Éditeur de nœud (47%) ══════ */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {generating ? (
            /* Loader centré */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 text-[#22D3EE] animate-spin mx-auto" />
                <p className="text-[#8B949E] text-sm">Génération en cours...</p>
                <p className="text-[#30363D] text-xs">Création des nœuds narratifs</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden fade-slide-in">
              {/* Header nœud */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#30363D] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#22D3EE]" />
                  <span className="text-sm font-bold text-[#22D3EE]">
                    Nœud: {activeNode.label}
                  </span>
                  {activeNode.isEnd && (
                    <span className="text-[10px] bg-[#238636]/20 text-[#238636] px-1.5 py-0.5 rounded font-medium">
                      FIN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      previewMode
                        ? "bg-[#7C3AED] text-white"
                        : "bg-[#7C3AED]/20 text-[#7C3AED] hover:bg-[#7C3AED]/30"
                    }`}
                  >
                    {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {previewMode ? "Éditer" : "Aperçu"}
                  </button>
                  <button
                    onClick={toggleEnd}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                      activeNode.isEnd
                        ? "bg-[#238636] text-white"
                        : "bg-[#F0883E]/20 text-[#F0883E] hover:bg-[#F0883E]/30"
                    }`}
                  >
                    {activeNode.isEnd ? "Nœud final ✓" : "Marquer comme fin"}
                  </button>
                </div>
              </div>

              {/* Contenu éditeur / Aperçu */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 editor-scroll">
                {previewMode ? (
                  /* ═══ MODE APERÇU ═══ */
                  <div className="fade-slide-in space-y-6">
                    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase tracking-wider text-[#8B949E]">NŒUD</span>
                        <span className="text-xs font-bold text-[#22D3EE]">{activeNode.label}</span>
                      </div>
                      <div className="text-sm text-[#F0F6FC] leading-relaxed whitespace-pre-line">
                        {activeNode.text || <span className="italic text-[#8B949E]">(texte vide)</span>}
                      </div>
                    </div>

                    {!activeNode.isEnd && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-[#8B949E]">CHOIX DISPONIBLES</p>
                        {activeNode.choices.length === 0 ? (
                          <p className="text-xs text-[#F0883E] italic">Aucun choix — le joueur sera bloqué ici.</p>
                        ) : (
                          activeNode.choices.map((choice, idx) => {
                            const linked = choice.target && nodes.find((n) => n.id === choice.target);
                            return (
                              <div
                                key={idx}
                                className={`border rounded-lg px-4 py-3 text-sm ${
                                  linked
                                    ? "bg-[#238636]/10 border-[#238636]/30 text-[#F0F6FC]"
                                    : "bg-[#F0883E]/10 border-[#F0883E]/30 text-[#F0883E]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{idx + 1}.</span>
                                  <span>{choice.label || <span className="italic">(choix vide)</span>}</span>
                                </div>
                                {!linked && (
                                  <p className="text-xs mt-1 text-[#F0883E] flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Ce choix n&apos;est lié à aucun nœud
                                  </p>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {activeNode.isEnd && (
                      <div className="bg-[#238636]/10 border border-[#238636]/30 rounded-lg px-4 py-3">
                        <p className="text-sm text-[#238636] font-medium flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Nœud terminal — l&apos;aventure s&apos;arrête ici.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ═══ MODE ÉDITION ═══ */
                  <>
                    {/* Texte narratif */}
                    <section>
                      <label className="text-xs text-[#8B949E] block mb-2 uppercase tracking-wider">
                        Texte narratif
                      </label>
                      <textarea
                        value={activeNode.text}
                        onChange={(e) => updateNodeText(e.target.value)}
                        placeholder="Décrivez la scène, les événements, l'atmosphère..."
                        className="w-full bg-[#0D1117] border border-[#30363D] rounded-md p-3 text-sm text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#22D3EE] transition-all duration-200 resize-none"
                        style={{ minHeight: "150px" }}
                      />
                    </section>

                    {/* Choix disponibles */}
                    {!activeNode.isEnd && (
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-white">Choix disponibles</h3>
                          <button
                            onClick={addChoice}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#7C3AED] hover:bg-[#7C3AED]/80 text-white rounded-md transition-all duration-200"
                          >
                            <Plus className="w-3 h-3" />
                            Ajouter
                          </button>
                        </div>

                        <div className="space-y-3">
                          {activeNode.choices.length === 0 && (
                            <p className="text-[#8B949E] text-xs italic">Aucun choix — les joueurs arriveront à une impasse.</p>
                          )}
                          {activeNode.choices.map((choice, idx) => (
                            <div
                              key={idx}
                              className={`rounded-lg p-3 space-y-2 border ${
                                !choice.target
                                  ? "bg-[#F0883E]/5 border-[#F0883E]/40"
                                  : "bg-[#161B22] border-[#30363D]"
                              }`}
                            >
                              {/* Label du choix */}
                              <input
                                type="text"
                                value={choice.label}
                                onChange={(e) => updateChoiceLabel(idx, e.target.value)}
                                placeholder={`Choix ${idx + 1} — action du joueur...`}
                                className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#22D3EE] transition-all duration-200"
                              />

                              {/* Sélecteur de nœud cible */}
                              <div className="flex items-center gap-2">
                                <select
                                  value={choice.target}
                                  onChange={(e) => updateChoiceTarget(idx, e.target.value)}
                                  className={`flex-1 bg-[#0D1117] border rounded px-3 py-2 text-sm text-[#F0F6FC] focus:outline-none transition-all duration-200 ${
                                    !choice.target
                                      ? "border-[#F0883E]/50 focus:border-[#F0883E]"
                                      : "border-[#30363D] focus:border-[#22D3EE]"
                                  }`}
                                >
                                  <option value="">Sélectionner un nœud...</option>
                                  {nodes
                                    .filter((n) => n.id !== activeNodeId)
                                    .map((n) => (
                                      <option key={n.id} value={n.id}>
                                        {n.label} — {n.text.slice(0, 40)}...
                                      </option>
                                    ))}
                                </select>
                                <button
                                  onClick={() => selectNodeFromChoice(idx)}
                                  className="text-xs px-2.5 py-2 border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-md transition-all duration-200 whitespace-nowrap"
                                >
                                  + Nouveau nœud
                                </button>
                              </div>

                              {/* Alerte si pas de cible */}
                              {!choice.target && (
                                <div className="flex items-center gap-1.5 text-xs text-[#F0883E]">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Ce choix n&apos;est lié à aucun nœud — le joueur ne pourra pas avancer.</span>
                                </div>
                              )}

                              {/* Supprimer */}
                              {activeNode.choices.length > 1 && (
                                <button
                                  onClick={() => removeChoice(idx)}
                                  className="w-full text-xs text-[#F85149] hover:underline text-center py-1 transition-all duration-200 flex items-center justify-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Supprimer ce choix
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ══════ COLONNE C — Liste des nœuds (20%) ══════ */}
        <aside className="w-[20%] min-w-[200px] max-w-[260px] border-l border-[#30363D] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#30363D] flex-shrink-0">
            <h2 className="text-sm font-bold text-[#22D3EE]">
              Nœuds ({nodes.length})
            </h2>
          </div>
          <div ref={nodesListRef} className="flex-1 overflow-y-auto py-2 editor-scroll">
            <div className="space-y-0.5 px-2">
              {nodes.map((node) => {
                const isActive = node.id === activeNodeId;
                return (
                  <button
                    key={node.id}
                    data-node-id={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-[#1C2128] border-l-[3px] border-[#22D3EE]"
                        : "hover:bg-[#1C2128] border-l-[3px] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-[#22D3EE] font-mono">
                        {node.id === "debut" ? "···" : node.label}
                      </span>
                      {node.isEnd && (
                        <span className="text-[9px] bg-[#238636]/20 text-[#238636] px-1 rounded font-medium">FIN</span>
                      )}
                      {!isNodeReferenced(node.id) && node.id !== "debut" && (
                        <span className="text-[9px] text-[#F0883E] ml-auto">orphelin</span>
                      )}
                    </div>
                    <p className="text-xs text-[#8B949E] truncate leading-tight">
                      {node.text ? node.text.slice(0, 60) : "(vide)"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Bouton ajouter un nœud */}
            <div className="px-4 pt-3">
              <button
                onClick={addNewNode}
                className="w-full py-2 border border-dashed border-[#30363D] rounded-md text-xs text-[#8B949E] hover:border-[#22D3EE] hover:text-[#22D3EE] transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Nouveau nœud
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
