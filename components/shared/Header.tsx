"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuthContext();

  const getUserInitials = () => {
    const username = user?.username || user?.email || "U";
    return username.substring(0, 2).toUpperCase();
  };

  if (user) {
    return (
      <nav className="border-b border-gray-800/50 backdrop-blur-sm bg-[#0a0e1a]/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/Logo_DreamQuest.png" alt="DreamQuest" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold text-cyan-400">DreamQuest</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/adventure" className="text-gray-400 hover:text-cyan-400 transition-colors font-medium">
                Aventures
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-red-400 hover:text-red-300 transition-colors font-medium font-bold">
                  ADMIN
                </Link>
              )}
              <Link href="/classement" className="text-gray-400 hover:text-white transition-colors">
                Classement
              </Link>
              <Link href="/profil" className="text-gray-400 hover:text-white transition-colors">
                Profil
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/create-character">
                <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
                  Nouveau Personnage
                </button>
              </Link>
              
              <Link href="/profil">
                <button 
                  className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold hover:bg-cyan-600 transition-colors"
                  title="Mon profil"
                >
                  {getUserInitials()}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-800/50 backdrop-blur-sm bg-[#0a0e1a]/80 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/Logo_DreamQuest.png" alt="DreamQuest" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold text-cyan-400">DreamQuest</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Accueil
            </Link>
            <Link href="/adventure" className="text-gray-400 hover:text-white transition-colors">
              Aventures
            </Link>
            <Link href="/create-character" className="text-gray-400 hover:text-white transition-colors">
              Créer
            </Link>
            <Link href="/classement" className="text-gray-400 hover:text-white transition-colors">
              Classement
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <button className="px-5 py-2.5 text-white hover:text-cyan-400 font-medium transition-colors">
                Connexion
              </button>
            </Link>
            <Link href="/auth/register">
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
