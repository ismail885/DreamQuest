"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";

function NavLinks({ user }: { user: { username?: string; email?: string; role?: string } | null }) {
 return (
 <>
 <Link href="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Accueil
 </Link>
 <Link href="/adventure" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Aventures
 </Link>
 {(user?.role === 'createur' || user?.role === 'admin') && (
 <Link href="/create-adventure" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
 Créateur
 </Link>
 )}
 {user?.role === 'admin' && (
 <Link href="/admin" className="text-red-400 hover:text-red-300 transition-colors font-medium font-bold">
 ADMIN
 </Link>
 )}
 <Link href="/classement" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Classement
 </Link>
 <Link href="/profil" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Profil
 </Link>
 </>
 );
}

function ActionButtons({ user }: { user: { username?: string; email?: string } | null }) {
  const getUserInitials = () => {
  const username = user?.username || user?.email || "U";
  return username.substring(0, 2).toUpperCase();
  };

  return (
  <>
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
  </>
  );
}

const Header = React.memo(function Header() {
 const { user } = useAuthContext();

 if (user) {
 return (
 <>
 <nav className="border-b border-gray-800/50 backdrop-blur-sm bg-deep/80 sticky top-0 z-50">
 <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
 <div className="flex items-center justify-between">
 <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
 <Image src="/Logo_DreamQuest.png" alt="DreamQuest" width={32} height={32} className="object-contain w-8 h-8 md:w-10 md:h-10" />
 <span className="text-lg md:text-xl font-bold text-cyan-400">DreamQuest</span>
 </Link>

 <div className="hidden md:flex items-center gap-8">
 <NavLinks user={user} />
 </div>

 <div className="hidden md:flex items-center gap-4">
 <ActionButtons user={user} />
 </div>
 </div>
 </div>
 </nav>
 </>
 );
 }

 return (
 <>
 <nav className="border-b border-gray-800/50 backdrop-blur-sm bg-deep/80 sticky top-0 z-50">
 <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
 <div className="flex items-center justify-between">
 <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
 <Image src="/Logo_DreamQuest.png" alt="DreamQuest" width={32} height={32} className="object-contain w-8 h-8 md:w-10 md:h-10" />
 <span className="text-lg md:text-xl font-bold text-cyan-400">DreamQuest</span>
 </Link>

 <div className="hidden md:flex items-center gap-8">
 <Link href="/" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Accueil
 </Link>
 <Link href="/adventure" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Aventures
 </Link>
 <Link href="/create-character" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Créer
 </Link>
 <Link href="/classement" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
 Classement
 </Link>
 </div>

 <div className="hidden md:flex items-center gap-4">
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
 </>
 );
});

export default Header;
