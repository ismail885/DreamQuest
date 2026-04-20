"use client";

import { useState } from "react";
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
  const [success, setSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"draft" | "pending" | "published">("draft");

  const handlePublish = async () => {
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
          status: "pending",
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
      setStatus("pending");
      setSuccess(true);
      setTimeout(() => { router.push("/dashboard"); }, 1500);
    } catch {
      setError("Erreur lors de la publication");
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = () => {
    if (!user || !title.trim()) { setError("Titre requis"); return; }
    const id = draftId || `draft_${Date.now()}`;
    const draft = { id, title, description, initialBranch, savedAt: new Date().toISOString() };
    localStorage.setItem(`dq_draft_${user.id}`, JSON.stringify(draft));
    setDraftId(id);
    setError(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const loadDraft = () => {
    if (!user) return;
    const saved = localStorage.getItem(`dq_draft_${user.id}`);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTitle(draft.title);
        setDescription(draft.description || "");
        setInitialBranch(draft.initialBranch);
        setDraftId(draft.id);
      } catch { }
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

      setSuccess(true);
      setTimeout(() => { router.push("/dashboard"); }, 1500);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (!loaded) { loadDraft(); setLoaded(true); }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-400">
            Creer une aventure
          </h1>
          <div className="flex gap-2">
            {title && initialBranch.text && (
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
              >
                {previewMode ? "Retourner" : "Preview"}
              </button>
            )}
            <button
              onClick={saveDraft}
              className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
            >
              Brouillon
            </button>
            {(status === "draft" || status === "pending") && (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                {status === "pending" ? "En attente" : "Publier"}
              </button>
            )}
            {status === "published" && (
              <span className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm">
                Publiee
              </span>
            )}
          </div>
        </div>

        {previewMode ? (
          <div className="bg-[#1a2235] border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <p className="text-gray-400 mb-6">{description}</p>
            <div className="bg-[#0a0e1a] border border-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-200 leading-relaxed">{initialBranch.text}</p>
            </div>
            <div className="space-y-3">
              {initialBranch.choice1 && (
                <button className="w-full text-left px-4 py-3 bg-[#0a0e1a] border border-gray-700 rounded-lg text-gray-200 hover:border-cyan-500/60 transition-colors">
                  {initialBranch.choice1}
                </button>
              )}
              {initialBranch.choice2 && (
                <button className="w-full text-left px-4 py-3 bg-[#0a0e1a] border border-gray-700 rounded-lg text-gray-200 hover:border-cyan-500/60 transition-colors">
                  {initialBranch.choice2}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a2235] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="Le titre de votre histoire"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a2235] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 h-24"
                placeholder="Une courte description"
              />
            </div>

            <div className="bg-[#1a2235] border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-4 text-cyan-400">Debut de l histoire</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Texte initial</label>
                <textarea
                  value={initialBranch.text}
                  onChange={(e) => setInitialBranch({ ...initialBranch, text: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0e1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 h-32"
                  placeholder="Le premier paragraphe..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Choix 1</label>
                  <input
                    type="text"
                    value={initialBranch.choice1}
                    onChange={(e) => setInitialBranch({ ...initialBranch, choice1: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0e1a] border border-gray-700 rounded-lg text-white text-sm"
                    placeholder="Premier choix"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Choix 2</label>
                  <input
                    type="text"
                    value={initialBranch.choice2}
                    onChange={(e) => setInitialBranch({ ...initialBranch, choice2: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0e1a] border border-gray-700 rounded-lg text-white text-sm"
                    placeholder="Deuxieme choix"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                Aventure creee ! Redirection...
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 rounded-lg font-semibold transition-colors"
            >
              Publier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}