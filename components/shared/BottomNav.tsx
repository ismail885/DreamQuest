"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

import { Home, Users, BookOpen, User, PlusCircle } from "lucide-react";

const navItems = [
 { href: "/dashboard", label: "Accueil", icon: Home },
 { href: "/adventure", label: "Aventures", icon: BookOpen },
 { href: "/create-character", label: "Créer", icon: Users },
 { href: "/profil", label: "Profil", icon: User },
];

const BottomNav = React.memo(function BottomNav() {
 const pathname = usePathname();
 const { user } = useAuthContext();
 const userRole = user?.role as string;
 const isCreator = user && (userRole === "createur" || userRole === "admin");

 return (
 <nav className="fixed bottom-0 left-0 right-0 bg-[#070b15]/95 backdrop-blur-md border-t border-gray-800/50 md:hidden z-50 safe-area-bottom">
 <div className="flex items-center justify-around py-2 px-4">
 {navItems.map((item) => {
 const isActive = pathname.startsWith(item.href);
 const Icon = item.icon;

 return (
 <Link
 key={item.href}
 href={item.href}
 className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
 isActive
 ? "text-cyan-400"
 : "text-gray-400 hover:text-white"
 }`}
 >
 <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
 <span className="text-xs font-medium">{item.label}</span>
 </Link>
 );
 })}
 {isCreator && (
 <Link
 href="/create-adventure"
 className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
 pathname.startsWith("/create-adventure")
 ? "text-purple-400"
 : "text-gray-400 hover:text-white"
 }`}
 >
 <PlusCircle size={24} strokeWidth={pathname.startsWith("/create-adventure") ? 2.5 : 2} />
 <span className="text-xs font-medium">Créateur</span>
 </Link>
 )}
 </div>
 </nav>
 );
});

export default BottomNav;
