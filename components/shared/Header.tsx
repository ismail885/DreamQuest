"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getUserInitials = () => {
    const username = user?.user_metadata?.username || user?.email || "U";
    return username.substring(0, 2).toUpperCase();
  };

  // Si l'utilisateur est connecté
  if (user) {
    return (
      <nav className="border-b border-gray-800/50 backdrop-blur-sm bg-[#0a0e1a]/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/Logo_DreamQuest.png"
                alt="DreamQuest Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold text-cyan-400">DreamQuest</span>
            </Link>

            {/* Navigation centrale */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                Aventures
              </Link>
              <Link href="/classement" className="text-gray-400 hover:text-white transition-colors">
                Classement
              </Link>
              <Link href="/profil" className="text-gray-400 hover:text-white transition-colors">
                Profil
              </Link>
            </div>

            {/* Boutons droite */}
            <div className="flex items-center gap-4">
              <Link href="/create">
                <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                  Nouveau Personnage
                </button>
              </Link>
              
              {/* Avatar avec initiales */}
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold hover:bg-cyan-600 transition-colors"
                title="Déconnexion"
              >
                {getUserInitials()}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Si l'utilisateur n'est pas connecté
  return (
    <nav className="border-b border-gray-800/50 backdrop-blur-sm bg-[#0a0e1a]/80 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/Logo_DreamQuest.png"
              alt="DreamQuest Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-cyan-400">DreamQuest</span>
          </Link>

          {/* Navigation centrale */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Accueil
            </Link>
            <Link href="/adventure" className="text-gray-400 hover:text-white transition-colors">
              Aventures
            </Link>
            <Link href="/create" className="text-gray-400 hover:text-white transition-colors">
              Créer
            </Link>
            <Link href="/classement" className="text-gray-400 hover:text-white transition-colors">
              Classement
            </Link>
          </div>

          {/* Boutons droite */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="px-5 py-2.5 text-white hover:text-cyan-400 font-medium transition-colors">
                Connexion
              </button>
            </Link>
            <Link href="/register">
              <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                S&apos;inscrire
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}