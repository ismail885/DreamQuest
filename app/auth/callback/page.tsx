"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Attendre un peu pour que Supabase traite l'authentification
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
      <div className="text-center">
        <Loader size="lg" message="Connexion en cours..." />
        <p className="mt-4 text-gray-400">Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  );
}
