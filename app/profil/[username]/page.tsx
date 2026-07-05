"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/shared/Header";
import PageBackground from "@/components/shared/PageBackground";
import Loader from "@/components/shared/Loader";
import { ArrowLeft, Users, BookOpen } from "lucide-react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    nom_utilisateur: string;
    date_creation: string | null;
  } | null>(null);
  const [characters, setCharacters] = useState<
    { nom_personnage: string; classe: string; niveau: number | null }[]
  >([]);
  const [adventures, setAdventures] = useState<
    { titre: string; popularite: number | null }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data: user } = await supabase
          .from("utilisateur")
          .select("id, nom_utilisateur, date_creation")
          .eq("nom_utilisateur", username)
          .maybeSingle();

        if (cancelled) return;

        if (!user) {
          router.push("/");
          return;
        }

        setProfile(user);

        const { data: chars } = await supabase
          .from("personnage")
          .select("nom_personnage, classe, niveau")
          .eq("id_utilisateur", user.id);

        if (cancelled) return;
        setCharacters(chars || []);

        const { data: adv } = await supabase
          .from("aventure")
          .select("titre, popularite")
          .eq("auteur_id", user.id);

        if (cancelled) return;
        setAdventures(adv || []);
      } catch {
        if (!cancelled) router.push("/");
        return;
      }

      if (!cancelled) setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [username, router]);

  if (loading) return <Loader fullScreen />;

  if (!profile) return null;

  const memberSince = profile.date_creation
    ? new Date(profile.date_creation).toLocaleDateString("fr-FR")
    : "—";

  return (
    <div className="min-h-screen text-white bg-deep flex flex-col">
      <PageBackground />
      <Header />

      <main className="relative max-w-2xl mx-auto w-full px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="card-base p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-cyan-500/30">
            {getInitials(profile.nom_utilisateur)}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {profile.nom_utilisateur}
          </h1>
          <p className="text-gray-400 text-sm">Membre depuis {memberSince}</p>
        </div>

        <div className="card-base p-6 mb-6">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personnages
          </h2>
          {characters.length > 0 ? (
            <div className="space-y-3">
              {characters.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-transparent border border-cyan-500/15 rounded-card"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {c.nom_personnage}
                    </p>
                    <p className="text-gray-400 text-sm">{c.classe}</p>
                  </div>
                  <span className="text-primary font-bold">
                    Niv {c.niveau ?? 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Aucun personnage</p>
          )}
        </div>

        <div className="card-base p-6">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Aventures
          </h2>
          {adventures.length > 0 ? (
            <div className="space-y-3">
              {adventures.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-transparent border border-cyan-500/15 rounded-card"
                >
                  <p className="font-semibold text-white">{a.titre}</p>
                  <span className="text-yellow-400 font-medium">
                    {a.popularite ?? 0} votes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Aucune aventure</p>
          )}
        </div>
      </main>
    </div>
  );
}
