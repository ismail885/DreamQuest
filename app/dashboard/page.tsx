"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Loader from "@/components/shared/Loader";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Pas connecté, rediriger vers login
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <Loader fullScreen message="Chargement de votre espace..." />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      <Header />

      {/* Contenu principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête de bienvenue */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenue, <span className="text-cyan-400">{user?.user_metadata?.username || "Aventurier"}</span> !
            </h1>
            <p className="text-gray-400">Prêt à vivre de nouvelles aventures ?</p>
          </div>

          {/* Section des aventures */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Mes Aventures</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Carte vide - Aucune aventure */}
              <div className="col-span-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucune aventure pour le moment</h3>
                <p className="text-gray-400 mb-6">Créez votre premier personnage et commencez votre quête !</p>
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all">
                  Créer un Personnage
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Vos Statistiques</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                <div className="text-3xl font-bold text-cyan-400 mb-2">0</div>
                <div className="text-gray-400 text-sm">Personnages créés</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
                <div className="text-gray-400 text-sm">Quêtes complétées</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">1</div>
                <div className="text-gray-400 text-sm">Niveau</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">0</div>
                <div className="text-gray-400 text-sm">Points d&apos;XP</div>
              </div>
            </div>
          </div>

          {/* Quêtes populaires */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Quêtes Populaires</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">La Quête du Dragon</h3>
                <p className="text-gray-400 text-sm mb-4">Affrontez le dragon légendaire...</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400">⭐ 4.8</span>
                  <span className="text-gray-500">1.2k joueurs</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Le Mystère de l&apos;Alchimiste</h3>
                <p className="text-gray-400 text-sm mb-4">Découvrez les secrets de la magie...</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400">⭐ 4.6</span>
                  <span className="text-gray-500">856 joueurs</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">L&apos;Épée de Feu</h3>
                <p className="text-gray-400 text-sm mb-4">Trouvez l&apos;arme légendaire...</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400">⭐ 4.9</span>
                  <span className="text-gray-500">2.1k joueurs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}