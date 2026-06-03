"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";

function NavLinks({ user, onNavigate }: { user: { username?: string; email?: string; role?: string } | null; onNavigate?: () => void }) {
 return (
 <>
 <Link href="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium" onClick={onNavigate}>
 Accueil
 </Link>
 <Link href="/adventure" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium" onClick={onNavigate}>
 Aventures
 </Link>
 {(user?.role === 'createur' || user?.role === 'admin') && (
 <Link href="/create-adventure" className="text-purple-400 hover:text-purple-300 transition-colors font-medium" onClick={onNavigate}>
 Créateur
 </Link>
 )}
 {user?.role === 'admin' && (
 <Link href="/admin" className="text-red-400 hover:text-red-300 transition-colors font-medium font-bold" onClick={onNavigate}>
 ADMIN
 </Link>
 )}
 <Link href="/classement" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium" onClick={onNavigate}>
 Classement
 </Link>
 <Link href="/profil" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium" onClick={onNavigate}>
 Profil
 </Link>
 </>
 );
}

function ActionButtons({ user, isMobile = false, onNavigate }: { user: { username?: string; email?: string } | null; isMobile?: boolean; onNavigate?: () => void }) {
  const getUserInitials = () => {
  const username = user?.username || user?.email || "U";
  return username.substring(0, 2).toUpperCase();
  };

  return (
  <>
  <Link href="/create-character" onClick={onNavigate}>
  <button className={`${isMobile ? 'w-full justify-center' : ''} px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors`}>
  Nouveau Personnage
  </button>
  </Link>
  <Link href="/profil" onClick={onNavigate}>
  <button 
  className={`${isMobile ? 'w-full justify-center' : ''} w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold hover:bg-cyan-600 transition-colors`}
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
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 const closeMobileMenu = () => setMobileMenuOpen(false);

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

 <button 
 className="md:hidden p-2 text-gray-400 hover:text-white"
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 >
 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
 </button>
 </div>
 </div>
 </nav>

 {mobileMenuOpen && (
 <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-deep ">
 <div className="flex flex-col p-4 space-y-4">
 <div className="flex flex-col gap-4">
 <NavLinks user={user} onNavigate={closeMobileMenu} />
 </div>
 <div className="flex flex-col gap-3 pt-4 border-t border-gray-800 ">
 <ActionButtons user={user} isMobile onNavigate={closeMobileMenu} />
 </div>
 </div>
 </div>
 )}
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

 <button 
 className="md:hidden p-2 text-gray-400 hover:text-white"
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 >
 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
 </button>
 </div>
 </div>
 </nav>

 {mobileMenuOpen && (
 <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-deep ">
 <div className="flex flex-col p-4 space-y-4">
 <div className="flex flex-col gap-4">
 <Link href="/" className="text-gray-400 hover:text-white transition-colors" onClick={closeMobileMenu}>
 Accueil
 </Link>
 <Link href="/adventure" className="text-gray-400 hover:text-white transition-colors" onClick={closeMobileMenu}>
 Aventures
 </Link>
 <Link href="/create-character" className="text-gray-400 hover:text-white transition-colors" onClick={closeMobileMenu}>
 Créer
 </Link>
 <Link href="/classement" className="text-gray-400 hover:text-white transition-colors" onClick={closeMobileMenu}>
 Classement
 </Link>
 </div>
 <div className="flex flex-col gap-3 pt-4 border-t border-gray-800 ">
 <Link href="/auth/login" onClick={closeMobileMenu}>
 <button className="w-full px-5 py-2.5 text-white hover:text-cyan-400 font-medium transition-colors">
 Connexion
 </button>
 </Link>
 <Link href="/auth/register" onClick={closeMobileMenu}>
 <button className="w-full px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">
 S&apos;inscrire
 </button>
 </Link>
 </div>
 </div>
 </div>
 )}
 </>
 );
});

export default Header;
