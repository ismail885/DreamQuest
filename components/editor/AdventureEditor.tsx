"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";
import {
  ChevronLeft, ChevronRight, Wand2, Send, Plus, Trash2,
  Loader2, CheckCircle2, Target, BookOpen, AlertTriangle, Eye, EyeOff,
  Rocket, Ghost, Search, Swords, Ship, Cpu, Sun, Heart
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

interface Choice {
  label: string;
  target: string;
  consequence?: {
    texte: string;
    combat?: { enemyId: string };
    evenement?: { type: string };
  };
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
  { icon: Ship, name: "Pirate", desc: "Trésors, mers et flibustes" },
  { icon: Cpu, name: "Cyberpunk", desc: "Néons, hackers et mégacorporations" },
  { icon: Sun, name: "Mythologique", desc: "Dieux, héros et légendes antiques" },
  { icon: Heart, name: "Romance", desc: "Passion, sentiments et destin" },
];

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

export default function AdventureEditor() {
  const router = useRouter();
  const { user } = useAuthContext();

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
  const savedChoicesRef = useRef<Choice[]>([]);

  useEffect(() => {
    if (nodesListRef.current) {
      const el = nodesListRef.current.querySelector(`[data-node-id="${activeNodeId}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeNodeId]);

  const generateWithAI = async () => {
    if (!title.trim()) {
      setError("Donnez d'abord un titre à l'aventure");
      return;
    }
    setGenerating(true);
    setError(null);
    setSuccess(null);

    const diffMap: Record<string, string> = {
      Facile: "facile", Normal: "normal", Difficile: "difficile", Expert: "legendaire",
    };

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: title,
          genre: currentGenre.name,
          difficulte: diffMap[difficulty] ?? "normal",
        }),
      });

      if (!res.ok) throw new Error("Erreur API");

      const a = await res.json();
      if (!a.embranchements || a.embranchements.length !== 3) {
        throw new Error("Format invalide");
      }

      const [e1, e2, e3] = a.embranchements;
      type GenChoix = { libelle: string; consequence: Choice["consequence"] };
      const toChoice = (c: GenChoix, target: string): Choice => ({
        label: c.libelle,
        target,
        consequence: c.consequence,
      });

      const newNodes: StoryNode[] = [
        {
          id: "debut", label: "Début", text: e1.texte, isEnd: false,
          choices: [toChoice(e1.choix[0], "n2"), toChoice(e1.choix[1], "n3")],
        },
        {
          id: "n2", label: "N2", text: e2.texte, isEnd: false,
          choices: [toChoice(e2.choix[0], "fin1"), toChoice(e2.choix[1], "fin2")],
        },
        {
          id: "n3", label: "N3", text: e3.texte, isEnd: false,
          choices: [toChoice(e3.choix[0], "fin1"), toChoice(e3.choix[1], "fin2")],
        },
        {
          id: "fin1", label: "Fin — Triomphe", isEnd: true, choices: [],
          text: "Votre périple s'achève sur une victoire chèrement acquise. Le souvenir de cette aventure vous suivra longtemps.",
        },
        {
          id: "fin2", label: "Fin — Amertume", isEnd: true, choices: [],
          text: "Le destin en a décidé autrement. Vous repartez marqué, mais vivant — certaines histoires ne se terminent jamais comme prévu.",
        },
      ];

      setTitle(String(a.titre).slice(0, 80));
      setDescription(a.description);
      setNodes(newNodes);
      setActiveNodeId("debut");
      setSuccess("Aventure générée avec succès !");
    } catch {
      setError("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

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
    if (activeNode.choices.length >= 2) return;
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
    const node = nodes.find((n) => n.id === activeNodeId);
    if (!node) return;
    const becomingEnd = !node.isEnd;
    if (becomingEnd) {
      savedChoicesRef.current = node.choices;
    }
    setNodes((prev) =>
      prev.map((n) =>
        n.id === activeNodeId
          ? { ...n, isEnd: becomingEnd, choices: becomingEnd ? [] : savedChoicesRef.current }
          : n,
      ),
    );
  };

  const selectNodeFromChoice = (choiceIdx: number) => {
    const choice = activeNode.choices[choiceIdx];
    if (choice.target && nodes.find((n) => n.id === choice.target)) {
      setActiveNodeId(choice.target);
    } else {
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

      const branchesToInsert = nodes.map((node) => ({
        texte: node.text,
        id_aventure: adventure.id,
        choix1: node.choices[0]?.label || null,
        choix2: node.choices[1]?.label || null,
        choix1_lien: null,
        choix2_lien: null,
        choix1_consequences: node.choices[0]?.consequence ?? null,
        choix2_consequences: node.choices[1]?.consequence ?? null,
      }));

      const { data: insertedBranches, error: branchError } = await supabase
        .from("embranchement")
        .insert(branchesToInsert)
        .select("id");

      if (branchError || !insertedBranches) throw branchError;

      const nodeIdMap = new Map<string, number>();
      nodes.forEach((node, i) => {
        nodeIdMap.set(node.id, insertedBranches[i].id);
      });

      const rootId = nodeIdMap.get("debut");
      if (rootId) {
        await supabase
          .from("aventure")
          .update({ embranchement_initial_id: rootId })
          .eq("id", adventure.id);
      }

      const updatePromises: Promise<unknown>[] = [];
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
          updatePromises.push(
            supabase.from("embranchement").update(updateData).eq("id", currentBranchId) as unknown as Promise<unknown>
          );
        }
      }

      await Promise.all(updatePromises);

      setSuccess("Aventure publiée ! Redirection...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <style>{`
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
    `}</style>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className="h-screen bg-deep text-white flex flex-col overflow-hidden"
    >
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="flex items-center justify-between px-6 py-3 border-b border-gray-800 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-all duration-200 text-sm group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour
          </button>
          <div className="w-px h-5 bg-gray-800" />
          <h1 className="text-xl font-bold text-primary">Création d&apos;Aventure</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>{nodes.length} nœud{nodes.length > 1 ? "s" : ""}</span>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        {/* ══════ COLONNE A — Configuration (33%) ══════ */}
        <aside className="w-[33%] min-w-[320px] border-r border-gray-800 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5 editor-scroll">
            {/* Carrousel de genre */}
            <section>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Genre</h2>
              <div className="relative">
                  {/* Carte genre */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={genreIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: easeOutExpo }}
                    className="genre-card-gradient rounded-xl h-[90px] flex flex-col items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <GenreIcon className="w-7 h-7 relative z-10 text-white" />
                    <p className="text-white font-bold text-base relative z-10">{currentGenre.name}</p>
                    <p className="text-white/70 text-xs relative z-10">{currentGenre.desc}</p>
                  </motion.div>
                </AnimatePresence>

                {/* Flèche gauche */}
                {genreIndex > 0 && (
                  <button
                    onClick={() => setGenreIndex((i) => i - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-800/80 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-all duration-300 ease-out hover:scale-110 text-gray-400 hover:text-white z-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Flèche droite */}
                {genreIndex < GENRES.length - 1 && (
                  <button
                    onClick={() => setGenreIndex((i) => i + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-800/80 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-all duration-300 ease-out hover:scale-110 text-gray-400 hover:text-white z-20"
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
                        ? "w-6 h-2 bg-primary"
                        : "w-2 h-2 bg-gray-800 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Séparateur */}
            <div className="border-t border-gray-800" />

            {/* Formulaire */}
            <section>
              <h2 className="text-sm font-bold text-white mb-3">Informations</h2>
              <div className="space-y-3">
                {/* Titre */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="title" className="text-xs text-gray-400">Titre de l&apos;aventure</label>
                    <span className={`text-[10px] ${title.length >= 75 ? "text-orange-400" : "text-gray-400"}`}>
                      {title.length}/80
                    </span>
                  </div>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                    placeholder="Titre de votre aventure..."
                    className="w-full bg-deep border border-gray-800 rounded-md px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="desc" className="text-xs text-gray-400 block mb-1">Description</label>
                  <textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Une courte description..."
                    rows={3}
                    className="w-full bg-deep border border-gray-800 rounded-md px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all duration-200 resize-none"
                  />
                </div>

                {/* Difficulté + Durée */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="diff" className="text-xs text-gray-400 block mb-1">Difficulté</label>
                    <select
                      id="diff"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-deep border border-gray-800 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all duration-200"
                    >
                      <option value="Facile">Facile</option>
                      <option value="Normal">Normal</option>
                      <option value="Difficile">Difficile</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dur" className="text-xs text-gray-400 block mb-1">Durée (min)</label>
                    <input
                      id="dur"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full bg-deep border border-gray-800 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  className="flex items-center gap-2 p-3 bg-green-600/10 border border-green-500/30 rounded-lg text-green-500 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Boutons d'action */}
            <div className="space-y-2">
              <button
                onClick={generateWithAI}
                disabled={!title.trim() || generating}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-deep font-bold rounded-lg transition-all duration-300 ease-out hover:scale-102 active:scale-98 hover:shadow-[0px_10px_25px_-3px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 text-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Générer
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || saving}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300 ease-out hover:scale-102 active:scale-98 hover:shadow-[0px_10px_25px_-3px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 text-sm"
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                <p className="text-gray-400 text-sm">Génération en cours...</p>
                <p className="text-gray-600 text-xs">Création des nœuds narratifs</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Header nœud */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">
                    Nœud: {activeNode.label}
                  </span>
                  {activeNode.isEnd && (
                    <span className="text-[10px] bg-green-600/20 text-green-500 px-1.5 py-0.5 rounded font-medium">
                      FIN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-300 ease-out hover:scale-105 flex items-center gap-1.5 ${
                      previewMode
                        ? "bg-violet-600 text-white"
                        : "bg-violet-600/20 text-violet-500 hover:bg-violet-600/30"
                    }`}
                  >
                    {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {previewMode ? "Éditer" : "Aperçu"}
                  </button>
                  <button
                    onClick={toggleEnd}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-300 ease-out hover:scale-105 ${
                      activeNode.isEnd
                        ? "bg-green-600 text-white"
                        : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    }`}
                  >
                    {activeNode.isEnd ? "Nœud final ✓" : "Marquer comme fin"}
                  </button>
                </div>
              </div>

              {/* Contenu éditeur / Aperçu */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 editor-scroll">
                <AnimatePresence mode="wait">
                  {previewMode ? (
                    /* ═══ MODE APERÇU ═══ */
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: easeOutExpo }}
                      className="space-y-6"
                    >
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] uppercase tracking-wider text-gray-400">NŒUD</span>
                          <span className="text-xs font-bold text-primary">{activeNode.label}</span>
                        </div>
                        <div className="text-sm text-white leading-relaxed whitespace-pre-line">
                          {activeNode.text || <span className="italic text-gray-400">(texte vide)</span>}
                        </div>
                      </div>

                    {!activeNode.isEnd && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">CHOIX DISPONIBLES</p>
                        {activeNode.choices.length === 0 ? (
                          <p className="text-xs text-orange-400 italic">Aucun choix — le joueur sera bloqué ici.</p>
                        ) : (
                          activeNode.choices.map((choice, idx) => {
                            const linked = choice.target && nodes.find((n) => n.id === choice.target);
                            return (
                              <div
                                key={idx}
                                className={`border rounded-lg px-4 py-3 text-sm ${
                                  linked
                                    ? "bg-green-600/10 border-green-500/30 text-white"
                                    : "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{idx + 1}.</span>
                                  <span>{choice.label || <span className="italic">(choix vide)</span>}</span>
                                </div>
                                {!linked && (
                                  <p className="text-xs mt-1 text-orange-400 flex items-center gap-1">
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
                      <div className="bg-green-600/10 border border-green-500/30 rounded-lg px-4 py-3">
                        <p className="text-sm text-green-500 font-medium flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Nœud terminal — l&apos;aventure s&apos;arrête ici.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* ═══ MODE ÉDITION ═══ */
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: easeOutExpo }}
                  >
                    {/* Texte narratif */}
                    <section>
                      <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">
                        Texte narratif
                      </label>
                      <textarea
                        value={activeNode.text}
                        onChange={(e) => updateNodeText(e.target.value)}
                        placeholder="Décrivez la scène, les événements, l'atmosphère..."
                        className="w-full bg-deep border border-gray-800 rounded-md p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all duration-200 resize-none"
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
                            disabled={activeNode.choices.length >= 2}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-violet-600 hover:bg-violet-600/80 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-all duration-300 ease-out hover:scale-105"
                          >
                            <Plus className="w-3 h-3" />
                            Ajouter
                          </button>
                        </div>

                        <div className="space-y-3">
                          {activeNode.choices.length === 0 && (
                            <p className="text-gray-400 text-xs italic">Aucun choix — les joueurs arriveront à une impasse.</p>
                          )}
                          {activeNode.choices.map((choice, idx) => (
                            <div
                              key={idx}
                              className={`rounded-lg p-3 space-y-2 border ${
                                !choice.target
                                  ? "bg-orange-500/5 border-orange-500/40"
                                  : "bg-gray-900 border-gray-800"
                              }`}
                            >
                              {/* Label du choix */}
                              <input
                                type="text"
                                value={choice.label}
                                onChange={(e) => updateChoiceLabel(idx, e.target.value)}
                                placeholder={`Choix ${idx + 1} — action du joueur...`}
                                className="w-full bg-deep border border-gray-800 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all duration-200"
                              />

                              {/* Sélecteur de nœud cible */}
                              <div className="flex items-center gap-2">
                                <select
                                  value={choice.target}
                                  onChange={(e) => updateChoiceTarget(idx, e.target.value)}
                                  className={`flex-1 bg-deep border rounded px-3 py-2 text-sm text-white focus:outline-none transition-all duration-200 ${
                                    !choice.target
                                      ? "border-orange-500/50 focus:border-orange-500"
                                      : "border-gray-800 focus:border-primary"
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
                                  className="text-xs px-2.5 py-2 border border-violet-500 text-violet-500 hover:bg-violet-600/10 rounded-md transition-all duration-200 whitespace-nowrap"
                                >
                                  + Nouveau nœud
                                </button>
                              </div>

                              {/* Alerte si pas de cible */}
                              {!choice.target && (
                                <div className="flex items-center gap-1.5 text-xs text-orange-400">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Ce choix n&apos;est lié à aucun nœud — le joueur ne pourra pas avancer.</span>
                                </div>
                              )}

                              {/* Supprimer */}
                              {activeNode.choices.length > 1 && (
                                <button
                                  onClick={() => removeChoice(idx)}
                                  className="w-full text-xs text-red-400 hover:underline text-center py-1 transition-all duration-200 flex items-center justify-center gap-1"
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
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </main>

        {/* ══════ COLONNE C — Liste des nœuds (20%) ══════ */}
        <aside className="w-[20%] min-w-[200px] max-w-[260px] border-l border-gray-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
            <h2 className="text-sm font-bold text-primary">
              Nœuds ({nodes.length})
            </h2>
          </div>
          <div ref={nodesListRef} className="flex-1 overflow-y-auto py-2 editor-scroll">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-0.5 px-2"
            >
              {nodes.map((node) => {
                const isActive = node.id === activeNodeId;
                return (
                  <motion.button
                    key={node.id}
                    data-node-id={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    variants={itemVariants}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-gray-800/80 border-l-[3px] border-primary"
                        : "hover:bg-gray-800/80 border-l-[3px] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-primary font-mono">
                        {node.id === "debut" ? "···" : node.label}
                      </span>
                      {node.isEnd && (
                        <span className="text-[9px] bg-green-600/20 text-green-500 px-1 rounded font-medium">FIN</span>
                      )}
                      {!isNodeReferenced(node.id) && node.id !== "debut" && (
                        <span className="text-[9px] text-orange-400 ml-auto">orphelin</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate leading-tight">
                      {node.text ? node.text.slice(0, 60) : "(vide)"}
                    </p>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Bouton ajouter un nœud */}
            <div className="px-4 pt-3">
              <button
                onClick={addNewNode}
                className="w-full py-2 border border-dashed border-gray-800 rounded-md text-xs text-gray-400 hover:border-primary hover:text-primary transition-all duration-300 ease-out hover:scale-102 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Nouveau nœud
              </button>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
    </>
  );
}

