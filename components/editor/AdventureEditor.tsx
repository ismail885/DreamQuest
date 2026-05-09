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

// Générateur de contenu avancé avec plusieurs embranchements
const generateAdventureContent = (genre: string, title: string): BranchNode[] => {
  // Contenu différent selon le genre
  const genreContent: Record<string, {
    opening: string;
    events: Array<{ text: string; choices: string[]; type?: string }>;
    endings: string[];
    locations: string[];
  }> = {
    fantasy: {
      locations: ["Forêt des Murmures", "Château abandonné", "Caverne du dragon", "Village mystérieux", "Temple antique"],
      opening: "Vous vous réveillez au milieu d'un monde où la magie et le danger vont de pair. Une quête majeure vous attend, et le destin du royaume repose peut-être entre vos mains. Selon la légende, seul un héros capable de satisfaire trois épreuves pourrait prétendre au titre de Champion du Royaume.",
      events: [
        {
          text: "Vous arrivez à la croisée des chemins. Trois panneaux indiquent des destinations différentes : au nord, la Forêt des Murmures où l'on dit que les esprits parlent ; à l'est, les ruines du Château Noir où un dragon endormi garde un trésor ; au sud, le Village des Artisans connu pour ses créatures magiques.",
          choices: ["Partir vers la Forêt des Murmures", "Explorer le Château Noir", "Aller au Village des Artisans"],
          type: "exploration"
        },
        {
          text: "Dans la forêt, vous rencontrez un elfe gardien. Il vous bloque le passage et vous pose une énigme : 'Je suis le commencement de l'éternité, la fin du temps et de l'espace. Qui suis-je ?'",
          choices: ["Répondre 'Le silence'", "Demander de l'aide", "Attaquer l'elfe"],
          type: "enigme"
        },
        {
          text: "Le dragon du Château Noir est finalement éveillé ! Ses yeux ardents vous fixent. Il semble disposé à négocier plutôt qu'à combattre. Une Scales écailleuse reflétant l'or massif brille sur son front.",
          choices: ["Combattre le dragon", "Négocier avec le dragon", "Chercher une arme dans les ruines"],
          type: "combat"
        },
        {
          text: "Le village vous offre un refuge, mais le chef vous explique qu'une malédiction frappe les cultures. Unemonstre des profondeurssort chaque nuit pour dévorer les récoltes.",
          choices: ["Chasser le monstre", "Aider à renforcer les défenses", "Chercher la source de la malédiction"],
          type: "quete"
        },
        {
          text: "Dans le temple antique, vous trouvez un autel avec trois objets sacrés : une épée brillante, un bouclier ancien et un livre de magie. Une voix résonne : 'Choisis celui qui te définit, héros.'",
          choices: ["Prendre l'épée", "Prendre le bouclier", "Prendre le livre"],
          type: "choix"
        },
        {
          text: "Un événement catastrophique secoue le monde : le soleil disparaît progressivement. Les créatures magiques становятся агрессивными. Vous devez trouver la cause avant que les ténèbres définitives n'arrivent.",
          choices: ["Chercher dans les montagnes", "Explorer les profondeurs", "Consulter le conseil des sages"],
          type: "aventure"
        }
      ],
      endings: [
        "Vous avez réussi toutes les épreuves et êtes devenu le Champion du royaume. Votre nom sera gravé dans les chronicles pour toujours.",
        "Le chemin fut long et semé d'embûches, mais vous avez trouvé votre place dans ce monde en tant que gardien de la paix.",
        "Malgré les difficultés incroyables, vous avez persévéré et réussi à sauver le royaume de la destruction.",
        "Vous avez découvert que le véritable héros n'est pas celui qui vainc les monstres, mais celui qui protège les innocents."
      ]
    },
    horror: {
      locations: ["Manoir hanté", "Cimetière maudit", "Hôpital abandonné", "Forêt ténébreuse", "Sous-sol secret"],
      opening: "La brume enveloppe les rues de cette petite ville forgotten. Quelque chose de mauvais rôde dans l'ombre. Votre curiosité vous a entraîné ici, mais saurez-vous survivre à ce qui vous attend ? On dit que ce lieu est maudit depuis que le culte clandestin a pratiqué ses rituels interdits il y a cinquante ans.",
      events: [
        {
          text: "Vous trouvez une porte qui n'était pas là hier. Elle est légèrement entrouverte, et une voix étouffée provn de l'intérieur : 'Aidez-moi... s'il vous plaît...'",
          choices: ["Entrer cautiously", "Appeler la police", "Partir immédiatement"],
          type: "mystere"
        },
        {
          text: "Dans le cimetière, vous trouvez une tombe fraîche avec une inscription bizarre : 'Celui qui réveillera le dormeur ne trouvera jamais la paix'. La terre semble avoir été remuée récemment.",
          choices: ["Creuser", "Lirez le livre ritual", "Retourner au village"],
          type: "enquete"
        },
        {
          text: "L'hôpital abandonné vous réserve une surprise terrifiante. Dans une salle du sous-sol, vous thérapeut des équipements médicaux encore branchés, et des murmures proviennent de la salle d'opération. Un scalpel scintille sur la table.",
          choices: ["Investiguer la salle", "Fuir vers la sortie", "Appeler à l'aide"],
          type: "horreur"
        },
        {
          text: "Dans la forêt, vous rencontrez une jeune femme en robe blanche. Elle vous regarde avec des yeux vides et murmure : 'Vous ne devriez pas être ici. Ils arrivent...' Avant de disparaître dans le brouillard.",
          choices: ["La suivre", "Courir dans la direction opposée", "Se cacher et attendre"],
          type: "rencontre"
        },
        {
          text: "Un journal ancien que vous avez trouvé révèle des secrets choquants sur la ville : les dirigeants ont caché un terrible secret pendant des décennies. Ce qu'ils ont fait dans le sous-sol du manoir ne devrait jamais être révélé.",
          choices: ["Confronter les dirigeants", "Continuer l'enquête", "Brûler le journal"],
          type: "revelation"
        },
        {
          text: "La chose que vous chassez vous a trouvé. Elle est dans la pièce avec vous, à peine visible dans l'obscurité. Vous pouvez sentir son souffle froid sur votre nuque. Une seule chance reste.",
          choices: ["Allumer la lumière", "Utiliser l'objet sacré", "Courir vers la fenêtre"],
          type: "climax"
        }
      ],
      endings: [
        "Vous avez survécu à cette nuit terrifiante. Mais savez-vous vraiment ce qui vous a échappé ? Certaines choses sont mieux laissées dans l'ombre.",
        "La vérité était trop horrible. Vous avez découvert que certaines choses ne devraient jamais être mises à jour.",
        "Vous êtes devenu ce que vous chassiez. Le cycle n'est pas terminé.",
        "Vous avez réussi à fuir, mais les souvenirs de cette nuit vous hanteront pour toujours."
      ]
    },
    scifi: {
      locations: ["Station spatiale", "Planète inconnue", "Vaisseau marchand", "Colonie lunaire", "Dimension parallèle"],
      opening: "Année 2347. L'humanité a conquis les étoiles, mais certains mystères restent irrésolus. Votre dernière mission pourrait bien改变 l'histoire de l'humanité. Un signal étrange en provenance d'un secteur inexploré a été détecté, et vous êtes le seul à pouvoir répondre à cet appel.",
      events: [
        {
          text: "Le signal provenait d'une planète non cartographiée. Votre scanner détecte une structure artificielle parfaitement préservée, comme si elle attendait depuis des siècles. Aucun signe de vie, mais une énergie inconnue émane de l'intérieur.",
          choices: ["Atterrir et explorer", "Envoyer un drone d'analyse", "Analyser à distance maximale"],
          type: "decouverte"
        },
        {
          text: "L'intelligence artificielle du vaisseau vous alerte : 'anomalie détectée. Probabilité de menace : supérieur à 87%. Recommendévasion immédiate.' Les capteurs commencent à détecter des mouvements autour du vessel.",
          choices: ["Armer les systèmes defensifs", "Tenter la communication pacifique", "Fuir vers l'hyperespace"],
          type: "confrontation"
        },
        {
          text: "Vous trouvez un laboratoire abandonné avec des expériences inachevées. Les écrans affichent des données sur des recherches génétiques interdits. Un liquide étrange pulse dans les containmentsts.",
          choices: ["Activer les systèmes de sécurité", "Collecter les données de recherche", "Détruire le laboratoire"],
          type: "science"
        },
        {
          text: "Un alien vous fait signe depuis la porte d'un compartment. Son expression faciale semble pacifique, mais ses mains restent masquées derrière son dos. Il semble vous reconnaître.",
          choices: ["Répondre au geste amical", "Rester sur vos gardes et observer", "Demander des informations"],
          type: "premiercontact"
        },
        {
          text: "La vérité sur votre mission se révèle enfin. Votre gouvernement avait des connaissances sur cette civilisation disparue et a envoyé des expéditions précédentes. Vous n'êtes pas le premier à avoir répondu à ce signal.",
          choices: ["Continuer la mission originale", "Alerter la résistance", "Prendre le contrôle du situatid"],
          type: "revelation"
        },
        {
          text: "Une dimension parallèle s'ouvre devant vous. À travers la brèche, vous apercevez une version alternative de vous-même qui vous fait signe de traverser. Le choix va changer votre destin à jamais.",
          choices: ["Traverser la brèche", "Rester dans votre dimension", "Refermer la brèche"],
          type: "multiverse"
        }
      ],
      endings: [
        "Vous avez changé le cours de l'histoire humaine en découvrant cette civilization avancée. L'humanité sera incontournablement transformée.",
        "La vérité sur l'univers n'était pas prête à être révélée. Certaines connaissances sont trop dangereuses.",
        "Votre sacrifice sera mémorisé par les générations futures comme l'un des plus grands héros de l'humanité.",
        "Vous avez réussi à établic un pont entre les civilizations, ouvrant la voie à une nouvelle ère de coopération galactique."
      ]
    },
    romance: {
      locations: ["Café littéraire", "Jardin public", "Musée artistique", "Plage isolé", "Ville éternelle"],
      opening: "Dans une ville où les destins se croisent chaque jour, deux âmes sont sur le point de se trouver. L'amour ne suit jamais un chemin prévisible. Ce pourrait être une simple rencontre au café, ou le début d'une histoire qui durera toute une vie.",
      events: [
        {
          text: "Un marché animé à Paris. Quelque chose attire votre regard - une personne qui semble chercher quelque chose de perdu. Elle lève les yeux et nos regards se croisent. Le temps s'arrête un instant.",
          choices: ["L'aborder directement", "L'observer discretement", "Passer votre chemin"],
          type: "rencontre"
        },
        {
          text: "La pluie commence à tomber soudainement. Un abri se présente sous un porche ancien, mais vous n'êtes pas seul. Une personne se trouve déjà là, regarder la pluie tomber.",
          choices: ["Demander à se joindre sous l'abri", "Attendre à l'extérieur sous la pluie", "Partir malgré la pluie"],
          type: "moment"
        },
        {
          text: "Un événement important approche - une exposition d'art ou un concert majeur. Vous pourriez invité cette personne spéciale à vous accompagner.",
          choices: ["Inviter officiellement", "Proposer quelque chose de différent", "Ne pas insister et respecter son espace"],
          type: "opportunite"
        },
        {
          text: "Un malentendu menace de tout gâcher. Des paroles mal interprétées ont créé une fracture entre vous. La communication est la seule voie vers la réconciliation.",
          choices: ["Expliquer calmement et clairement", "Laisser du temps pour la réflexion", "Insister pour s'expliquer immédiatement"],
          type: "crise"
        },
        {
          text: "Cette personne vous confie un secret profond - une partie de leur vie qu'ils n'ont jamais révélée à personne. Cette confiance vous touche profondément.",
          choices: ["Partager un secret en retour", "Ecouter sans jugement", "Promettre de garder le secret"],
          type: "confiance"
        },
        {
          text: "Le moment décisif est arrivé. Vous devez faire un choix qui déterminera l'avenir de votre relation. Le cœur balance entre la peur et l'espoir.",
          choices: ["Declarer vos sentiments", "Prendre du recul", "Attendre le bon moment"],
          type: "decisi"
        }
      ],
      endings: [
        "Votre histoire commence à peine. L'avenir vous tend les bras avec tout ce qu'il contient d'inconnu et de prometteur.",
        "Certains amours durent éternellement. Le votre sera inscrit dans les étoiles.",
        "Ensemble, vous avez trouvé ce que vous cherchiez - un amour véritable qui dépasse toutes les attentes.",
        "Vous avez appris que l'amour n'est pas un sentiment, mais une décision quotidienne de choisir l'autre."
      ]
    }
  };

  const content = genreContent[genre] || genreContent.fantasy;
  const location = content.locations[Math.floor(Math.random() * content.locations.length)];
  
  // Créer les nœuds de l'aventure avec une structure plus riche
  const nodes: BranchNode[] = [];
  
  // Personnaliser l'ouverture avec le lieu et le titre
  const adventureTitle = (title || "").trim() || "Aventure";
  const personalizedOpening = content.opening
    .replace("ce lieu", location.toLowerCase())
    .replace("une quête majeure", `la quête de ${adventureTitle}`)
    .replace("cette civilization", `la civilization de ${adventureTitle}`);
  
  nodes.push({
    id: "root",
    text: personalizedOpening,
    choices: [
      { text: content.events[0].choices[0], link: "node_1", consequences: "" },
      { text: content.events[0].choices[1], link: "node_2", consequences: "" },
      { text: content.events[0].choices[2], link: "node_3", consequences: "" }
    ]
  });

  // Créer les nœuds événementiels avec des embranchements multiples
  for (let i = 1; i < content.events.length; i++) {
    const event = content.events[i];
    const choiceCount = 2 + Math.floor(Math.random() * 2); // 2-3 choix par nœud
    
    const choices: Choice[] = [];
    for (let j = 0; j < Math.min(choiceCount, event.choices.length); j++) {
      // Créer un embranchement différent pour chaque choix
      const nextNodeId = i < content.events.length - 1 ? `node_${i}_${j}` : `ending_${i}_${j}`;
      choices.push({
        text: event.choices[j],
        link: nextNodeId,
        consequences: event.type === "combat" ? JSON.stringify({ type: "combat", level: 1 }) : ""
      });
    }

    nodes.push({
      id: `node_${i}`,
      text: event.text,
      choices,
      isEnd: false
    });
  }

  // Ajouter les fins multiples
  content.endings.forEach((ending, idx) => {
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
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 font-medium disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                {generating ? "Génération..." : "Générer avec IA"}
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