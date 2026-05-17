"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/shared/Loader";

function buildUsername(user: User): string {
  const fromMeta =
    (user.user_metadata?.user_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.preferred_username as string | undefined) ||
    "";

  const fromEmail = user.email ? user.email.split("@")[0] : "joueur";
  const candidate = (fromMeta || fromEmail || "joueur").trim();
  return candidate.slice(0, 50) || "joueur";
}

async function ensureUtilisateurAfterOAuth(user: User): Promise<void> {
  if (!user.email) {
    throw new Error("Email OAuth manquant");
  }

  const username = buildUsername(user);

  const { data: existingByAuthId, error: existingByAuthIdError } = await supabase
    .from("utilisateur")
    .select("id, nom_utilisateur, email, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (existingByAuthIdError) {
    throw existingByAuthIdError;
  }

  if (existingByAuthId) {
    return;
  }

  const { data: updatedByEmail, error: updateError } = await supabase
    .from("utilisateur")
    .update({
      auth_id: user.id,
      nom_utilisateur: username,
    })
    .eq("email", user.email)
    .is("auth_id", null)
    .select("id, nom_utilisateur, email, role");

  if (updateError) {
    throw updateError;
  }

  if (updatedByEmail && updatedByEmail.length > 0) {
    return;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("utilisateur")
    .insert({
      nom_utilisateur: username,
      email: user.email,
      mot_de_passe: "",
      role: "joueur",
      auth_id: user.id,
    })
    .select("id, nom_utilisateur, email, role")
    .single();

  if (insertError) {
    throw insertError;
  }

  if (inserted) {
    // User créé avec succès — AuthContext.onAuthStateChange va détecter la session
  }
}

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError("Erreur lors de la connexion");
          return;
        }

        if (session?.user) {
          await ensureUtilisateurAfterOAuth(session.user);
          document.cookie = `auth_user=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
          router.replace("/dashboard");
        } else {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            const { data: newSession } = await supabase.auth.refreshSession();
            if (newSession?.user) {
              await ensureUtilisateurAfterOAuth(newSession.user);
              router.replace("/dashboard");
              return;
            }
          }
          
          setError("Aucun utilisateur trouvé");
        }
      } catch {
        setError("Erreur lors de la création du profil utilisateur");
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] dark:bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Erreur</h1>
          <p className="text-gray-400 dark:text-gray-500 mb-4">{error}</p>
          <a href="/auth/login" className="text-cyan-400 hover:underline">
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] dark:bg-gray-50">
      <div className="text-center">
        <Loader size="lg" message="Connexion en cours..." />
        <p className="mt-4 text-gray-400 dark:text-gray-500">Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  );
}
