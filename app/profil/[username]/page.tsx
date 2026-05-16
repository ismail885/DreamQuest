"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/shared/Loader";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ nom_utilisateur: string; date_creation: string } | null>(null);
  const [characters, setCharacters] = useState<{ nom_personnage: string; classe: string; niveau: number }[]>([]);
  const [adventures, setAdventures] = useState<{ titre: string; popularite: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: user } = await supabase
        .from("utilisateur")
        .select("id, nom_utilisateur, date_creation")
        .eq("nom_utilisateur", username)
        .single();

      if (!user) { router.push("/"); return; }

      setProfile(user);

      const { data: chars } = await supabase
        .from("personnage")
        .select("nom_personnage, classe, niveau")
        .eq("id_utilisateur", (user as { id: number }).id);

      setCharacters(chars || []);

      const { data: adv } = await supabase
        .from("aventure")
        .select("titre, popularite")
        .eq("auteur_id", (user as { id: number }).id);

      setAdventures(adv || []);
      setLoading(false);
    };

    load();
  }, [username, router]);

  if (loading) return <Loader fullScreen />;

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-15"></div>
      <div className="relative z-10 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#0f1623] border border-gray-700/50 rounded-xl p-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {username.substring(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-center">{profile.nom_utilisateur}</h1>
          <p className="text-gray-400 text-center text-sm">
            Membre depuis {new Date(profile.date_creation).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="bg-[#0f1623] border border-gray-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Personnages</h2>
          {characters.length > 0 ? (
            <div className="space-y-3">
              {characters.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#1a2332] rounded-lg">
                  <div>
                    <p className="font-semibold">{c.nom_personnage}</p>
                    <p className="text-gray-400 text-sm">{c.classe}</p>
                  </div>
                  <span className="text-cyan-400 font-bold">Niv {c.niveau}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Aucun personnage</p>
          )}
        </div>

        <div className="bg-[#0f1623] border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Aventures</h2>
          {adventures.length > 0 ? (
            <div className="space-y-3">
              {adventures.map((a, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#1a2332] rounded-lg">
                  <p className="font-semibold">{a.titre}</p>
                  <span className="text-yellow-400">{a.popularite} votes</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Aucune aventure</p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}