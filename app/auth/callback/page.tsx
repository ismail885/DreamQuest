"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/components/shared/Loader";
import { useLanguage } from "@/context/LanguageContext";

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
 const { t } = useLanguage();
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
   setError(t("auth.errors.callbackError"));
   return;
   }

   if (session?.access_token) {
   await ensureUtilisateurAfterOAuth(session.access_token);
   router.replace("/dashboard");
   } else {
   setError(t("auth.errors.noUserFound"));
   }
   } catch {
   setError(t("auth.errors.profileCreationError"));
  }
  };

  handleCallback();
  }, [router, t]);

 if (error) {
 return (
 <main className="min-h-screen flex items-center justify-center bg-deep ">
 <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-400 mb-4">{t("common.error")}</h1>
 <p className="text-gray-400 mb-4">{error}</p>
 <a href="/auth/login" className="text-cyan-400 hover:underline">
  {t("auth.backToLogin")}
 </a>
 </div>
 </main>
 );
 }

 return (
 <main className="min-h-screen flex items-center justify-center bg-deep ">
 <div className="text-center">
  <Loader size="lg" message={t("auth.loggingIn")} />
  <p className="mt-4 text-gray-400 ">{t("auth.redirecting")}</p>
 </div>
 </main>
 );
}
