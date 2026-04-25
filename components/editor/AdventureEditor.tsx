"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthContext } from "@/context/AuthContext";

interface BranchNode {
  id: string;
  text: string;
  choice1: string;
  choice1Link: string;
  choice2: string;
  choice2Link: string;
}

interface GenrePreview {
  key: Genre;
  title: string;
  subtitle: string;
  summary: string;
  accent: string;
  bars: Array<{ label: string; value: number; color: string }>;
  tags: string[];
}

// Générateurs de contenus par genre
const STORY_TEMPLATES = {
  fantasy: {
    openings: [
      "Vous vous réveillez dans une forêt mystique où les arbres scintillent d'une lumière surnaturelle.",
      "Le château de Valdoria apparaît devant vous, ses tours s'élevant vers un ciel violet.",
      "Dans la taverne du village, un étranger vous tend une carte anciennes recouverte de runes.",
    ],
    events: [
      {
        text: "Vous rencontrez un dragon endormi",
        choices: ["Combattre", "Fuire", "Parler"],
      },
      {
        text: "Uneportal magique apparaît",
        choices: ["Entrer", "L'ignorer", "L'étudier"],
      },
      {
        text: "Un magicien vous propose une quète",
        choices: ["Accepter", "Refuser", "Négocier"],
      },
    ],
  },
  horror: {
    openings: [
      "La maison abandonnée semble vous appeler depuis l'obscurité.",
      "Un froid glacial vous parcour l'échine alors que vous entrez dans le cimetière.",
      "Les murmures ne cessent de s'intensifier dans la pièce obscure.",
    ],
    events: [
      {
        text: "Une silhouette apparaît dans l'ombre",
        choices: ["Investiguer", "Courir", "Se cacher"],
      },
      {
        text: "Vous trouvez un journal étrange",
        choices: ["Le lire", "Le brûler", "Le prendre"],
      },
      {
        text: "Des pas approchent",
        choices: ["Se prépare à combattre", "Se taire", "Appeler à l'aide"],
      },
    ],
  },
  scifi: {
    openings: [
      "Le vaisseau spatial tremble alors que vous approchez de la Station Omicron.",
      "Dans le futur año 2157, la Terre n'existe plus que dans vos souvenirs.",
      "L'intelligence artificelle vous transmits un message urgent.",
    ],
    events: [
      {
        text: "Un signal misterioso provient de l'espace",
        choices: ["Répondre", "Analyser", "Ignorer"],
      },
      {
        text: "Vous découvre un androïde thérapeut",
        choices: ["L'activer", "Le détruite", "L'étudier"],
      },
      {
        text: "Une alerte résonne dans le vaisseau",
        choices: ["Investiguer", "Fuir", "Demander de l'aide"],
      },
    ],
  },
};

type Genre = keyof typeof STORY_TEMPLATES;

const GENRE_PREVIEWS: GenrePreview[] = [
  {
    key: "fantasy",
    title: "Fantasy",
    subtitle: "Royaumes anciens, quêtes sacrées et magie en éveil.",
    summary:
      "Idéal pour une aventure héroïque avec artefacts, créatures mythiques et choix moraux forts.",
    accent: "from-cyan-500 to-blue-500",
    bars: [
      { label: "Épique", value: 8, color: "bg-cyan-400" },
      { label: "Mystère", value: 6, color: "bg-blue-400" },
      { label: "Aventure", value: 9, color: "bg-sky-400" },
      { label: "Danger", value: 7, color: "bg-indigo-400" },
    ],
    tags: ["Quête", "Magie", "Héritage"],
  },
  {
    key: "horror",
    title: "Horreur",
    subtitle: "Ambiance oppressante, tension lente et révélations inquiétantes.",
    summary:
      "Parfait pour une histoire sombre où l'exploration et la survie priment sur la force brute.",
    accent: "from-rose-500 to-red-500",
    bars: [
      { label: "Tension", value: 9, color: "bg-rose-400" },
      { label: "Mystère", value: 8, color: "bg-red-400" },
      { label: "Survie", value: 7, color: "bg-orange-400" },
      { label: "Violence", value: 6, color: "bg-pink-400" },
    ],
    tags: ["Brume", "Secrets", "Survie"],
  },
  {
    key: "scifi",
    title: "Science-fiction",
    subtitle: "Stations orbitales, IA instables et mondes à redécouvrir.",
    summary:
      "Idéal pour une aventure technologique avec exploration spatiale et dilemmes futuristes.",
    accent: "from-violet-500 to-cyan-500",
    bars: [
      { label: "Technologie", value: 9, color: "bg-violet-400" },
      { label: "Exploration", value: 8, color: "bg-cyan-400" },
      { label: "Rythme", value: 7, color: "bg-sky-400" },
      { label: "Intrigue", value: 8, color: "bg-fuchsia-400" },
    ],
    tags: ["IA", "Espace", "Futur"],
  },
];

export default function AdventureEditor() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [initialBranch, setInitialBranch] = useState<BranchNode>({
    id: "start",
    text: "",
    choice1: "",
    choice1Link: "",
    choice2: "",
    choice2Link: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genreIndex, setGenreIndex] = useState(0);

  const selectedGenre = GENRE_PREVIEWS[genreIndex];
  const genre = selectedGenre.key;

  useEffect(() => {
    if (!user) {
      return;
    }

    const saved = localStorage.getItem(`dq_draft_${user.id}`);
    if (!saved) {
      return;
    }

    try {
      const draft = JSON.parse(saved);
      setTitle(draft.title);
      setDescription(draft.description || "");
      setInitialBranch(draft.initialBranch);
      setDraftId(draft.id);
    } catch {
      // Ignore malformed drafts and keep the editor usable.
    }
  }, [user]);

  const selectGenre = (nextIndex: number) => {
    const normalizedIndex = (nextIndex + GENRE_PREVIEWS.length) % GENRE_PREVIEWS.length;
    setGenreIndex(normalizedIndex);
  };

  // Générer une histoire avec l'IA (templates)
  const generateWithAI = async () => {
    if (!title.trim()) {
      setError("Donnez d'abord un titre");
      return;
    }
    setGenerating(true);
    setError(null);

    try {
      // Simuler une génération AI avec des templates
      const templates = STORY_TEMPLATES[genre];
      const randomOpening =
        templates.openings[
          Math.floor(Math.random() * templates.openings.length)
        ];
      const randomEvent =
        templates.events[Math.floor(Math.random() * templates.events.length)];

      setInitialBranch({
        ...initialBranch,
        text: `${title}: ${randomOpening}`,
        choice1: randomEvent.choices[0],
        choice2: randomEvent.choices[1],
      });
    } catch {
      setError("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const saveDraft = () => {
    if (!user || !title.trim()) {
      setError("Titre requis");
      return;
    }
    try {
      const id = draftId || `draft_${Date.now()}`;
      const draft = {
        id,
        title,
        description,
        initialBranch,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`dq_draft_${user.id}`, JSON.stringify(draft));
      setDraftId(id);
      setError(null);
      setNotice("Brouillon enregistré");
      setTimeout(() => setNotice(null), 2000);
    } catch {
      setError("Erreur lors de la sauvegarde en local");
    }
  };

  const handleSave = async () => {
    if (!user || !title.trim() || !initialBranch.text.trim()) {
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
          auteur_id: user.id,
        })
        .select()
        .single();

      if (advError) throw advError;

      const { error: branchError } = await supabase
        .from("embranchement")
        .insert({
          texte: initialBranch.text,
          choix1: initialBranch.choice1 || null,
          choix1_lien: null,
          choix2: initialBranch.choice2 || null,
          choix2_lien: null,
          id_aventure: adventure.id,
        });

      if (branchError) throw branchError;

      await supabase
        .from("aventure")
        .update({ embranchement_initial_id: 1 })
        .eq("id", adventure.id);

      setNotice("Aventure créée ! Redirection...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0e1a] px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-cyan-400 transition-colors hover:text-cyan-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="mt-6 text-3xl font-bold text-cyan-400 md:text-4xl">
            Création d&apos;Aventure
          </h1>
        </div>

        <div className="relative mb-8">
          {genreIndex > 0 && (
            <button
              onClick={() => selectGenre(genreIndex - 1)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#1a2332]/90 p-3 transition-all duration-200 hover:scale-110 hover:bg-cyan-600/50 active:scale-95"
              aria-label="Genre précédent"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="mx-auto max-w-2xl px-12 transition-all duration-300">
            <div className="rounded-[28px] border border-white/10 bg-[#111827]/90 p-6 shadow-[0_30px_60px_-20px_rgba(8,145,178,0.35)] backdrop-blur-sm md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-md">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">
                    {selectedGenre.title}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-white">
                    {selectedGenre.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {selectedGenre.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {selectedGenre.summary}
                  </p>
                </div>

                <div className={`flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedGenre.accent} p-[1px] shadow-lg shadow-cyan-950/40`}>
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#0a0e1a] text-center">
                    <div>
                      <div className="text-xs uppercase tracking-[0.35em] text-slate-500">
                        Mode
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {selectedGenre.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-end">
                <div className="space-y-3">
                  {selectedGenre.bars.map((bar) => (
                    <div key={bar.label} className="flex items-center gap-4">
                      <div className="flex w-24 items-center gap-2 text-sm text-slate-300">
                        <span className={`h-3 w-3 rounded-full ${bar.color}`} />
                        {bar.label}
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${bar.color}`}
                          style={{ width: `${bar.value * 10}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-sm font-semibold text-cyan-300">
                        {bar.value}/10
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {selectedGenre.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {genreIndex < GENRE_PREVIEWS.length - 1 && (
            <button
              onClick={() => selectGenre(genreIndex + 1)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#1a2332]/90 p-3 transition-all duration-200 hover:scale-110 hover:bg-cyan-600/50 active:scale-95"
              aria-label="Genre suivant"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {GENRE_PREVIEWS.map((preview, index) => (
            <button
              key={preview.key}
              onClick={() => selectGenre(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === genreIndex
                  ? "w-8 bg-cyan-400 shadow-lg shadow-cyan-400/30"
                  : "w-2 bg-gray-700 hover:w-4 hover:bg-gray-500"
              }`}
              aria-label={`Sélectionner ${preview.title}`}
            />
          ))}
        </div>

        <form className="mx-auto max-w-2xl space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label htmlFor="title" className="mb-3 block text-sm font-medium text-white">
              Nom de l&apos;Aventure
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le nom de votre aventure..."
              className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              maxLength={80}
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-3 block text-sm font-medium text-white">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Une courte description pour planter le décor..."
              className="h-24 w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827]/90 p-5 shadow-lg shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-cyan-400">Générateur IA</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Le début est généré à partir du genre sélectionné.
                </p>
              </div>
              <button
                type="button"
                onClick={generateWithAI}
                disabled={generating}
                className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-500/50"
              >
                {generating ? "Génération..." : "Générer"}
              </button>
            </div>

            <div>
              <label htmlFor="initialText" className="mb-3 block text-sm font-medium text-white">
                Texte initial
              </label>
              <textarea
                id="initialText"
                value={initialBranch.text}
                onChange={(e) => setInitialBranch({ ...initialBranch, text: e.target.value })}
                placeholder="Le premier paragraphe de votre aventure..."
                className="h-32 w-full rounded-lg border border-gray-700 bg-[#0a0e1a] px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="choice1" className="mb-3 block text-sm font-medium text-white">
                  Choix 1
                </label>
                <input
                  id="choice1"
                  type="text"
                  value={initialBranch.choice1}
                  onChange={(e) =>
                    setInitialBranch({
                      ...initialBranch,
                      choice1: e.target.value,
                    })
                  }
                  placeholder="Premier choix"
                  className="w-full rounded-lg border border-gray-700 bg-[#0a0e1a] px-4 py-3 text-sm text-white transition-all placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="choice2" className="mb-3 block text-sm font-medium text-white">
                  Choix 2
                </label>
                <input
                  id="choice2"
                  type="text"
                  value={initialBranch.choice2}
                  onChange={(e) =>
                    setInitialBranch({
                      ...initialBranch,
                      choice2: e.target.value,
                    })
                  }
                  placeholder="Deuxième choix"
                  className="w-full rounded-lg border border-gray-700 bg-[#0a0e1a] px-4 py-3 text-sm text-white transition-all placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {notice && (
            <div className="rounded-lg border border-green-500/60 bg-green-500/10 p-3 text-sm text-green-300">
              {notice}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 font-semibold text-yellow-300 transition-colors hover:bg-yellow-500/20"
            >
              Enregistrer le brouillon
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600"
            >
              {saving ? "Création en cours..." : "Créer votre Aventure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
