"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/shared/Loader";
import { ArrowLeft, Users, BookOpen } from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    nom_utilisateur: string;
    date_creation: string;
  } | null>(null);
  const [characters, setCharacters] = useState<
    { nom_personnage: string; classe: string; niveau: number }[]
  >([]);
  const [adventures, setAdventures] = useState<
    { titre: string; popularite: number }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      const { data: user } = await supabase
        .from("utilisateur")
        .select("id, nom_utilisateur, date_creation")
        .eq("nom_utilisateur", username)
        .single();

      if (!user) {
        router.push("/");
        return;
      }

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
    <div className="min-h-screen text-white bg-[#070b15]">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(148deg,#0c0e1a 0%,#0f1729 25%,#1a1f3a 50%,#0f1729 75%,#0c0e1a 100%)",
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(6,182,212,0.10)",
            left: "25%",
            top: 0,
            opacity: 0.83,
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(59,130,246,0.10)",
            right: "25%",
            top: "696px",
            opacity: 0.51,
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-[40px]"
          style={{
            background: "rgba(99,102,241,0.10)",
            left: "51.54%",
            top: "505px",
            opacity: 0.93,
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[rgba(6,182,212,0.3)]">
            {username.substring(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {profile.nom_utilisateur}
          </h1>
          <p className="text-gray-400 text-sm">
            Membre depuis{" "}
            {new Date(profile.date_creation).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#06b6d4] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personnages
          </h2>
          {characters.length > 0 ? (
            <div className="space-y-3">
              {characters.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-transparent border border-[rgba(6,182,212,0.15)] rounded-[10px]"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {c.nom_personnage}
                    </p>
                    <p className="text-gray-400 text-sm">{c.classe}</p>
                  </div>
                  <span className="text-[#06b6d4] font-bold">
                    Niv {c.niveau}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Aucun personnage</p>
          )}
        </div>

        <div className="backdrop-blur-[10px] bg-[rgba(15,23,42,0.6)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6">
          <h2 className="text-lg font-bold text-[#06b6d4] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Aventures
          </h2>
          {adventures.length > 0 ? (
            <div className="space-y-3">
              {adventures.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-transparent border border-[rgba(6,182,212,0.15)] rounded-[10px]"
                >
                  <p className="font-semibold text-white">{a.titre}</p>
                  <span className="text-yellow-400 font-medium">
                    {a.popularite} votes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Aucune aventure</p>
          )}
        </div>
      </div>
    </div>
  );
}
