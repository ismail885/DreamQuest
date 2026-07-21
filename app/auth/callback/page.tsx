"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/shared/Loader";

async function ensureUtilisateurAfterOAuth(accessToken: string): Promise<void> {
  const res = await fetch('/api/auth/oauth-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la création du profil');
  }
}

export default function AuthCallback() {
 const router = useRouter();
 const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const handleCallback = async () => {
  try {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  
  if (accessToken) {
  // Utiliser le token d'accès directement pour créer le profil côté serveur
  await ensureUtilisateurAfterOAuth(accessToken);
  // Rediriger vers la page de callback Supabase interne pour finaliser la session
  router.replace("/dashboard");
  return;
  }
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
  setError("Erreur lors de la connexion");
  return;
  }

  if (session?.access_token) {
  await ensureUtilisateurAfterOAuth(session.access_token);
  router.replace("/dashboard");
  } else {
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
 <main className="min-h-screen flex items-center justify-center bg-deep ">
 <div className="text-center p-8">
 <h1 className="text-2xl font-bold text-red-400 mb-4">Erreur</h1>
 <p className="text-gray-400 mb-4">{error}</p>
 <a href="/auth/login" className="text-cyan-400 hover:underline">
 Retour à la connexion
 </a>
 </div>
 </main>
 );
 }

 return (
 <main className="min-h-screen flex items-center justify-center bg-deep ">
 <div className="text-center">
 <Loader size="lg" message="Connexion en cours..." />
 <p className="mt-4 text-gray-400 ">Redirection vers votre tableau de bord...</p>
 </div>
 </main>
 );
}
