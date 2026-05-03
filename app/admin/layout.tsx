"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  UserRound, 
  Settings, 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Aventures", href: "/admin/adventures", icon: BookOpen },
  { name: "Personnages", href: "/admin/characters", icon: UserRound },
  { name: "Paramètres", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setIsAuthorized(true);
      }
    } else if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-tertiary border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center">
              <span className="text-content-primary font-bold text-xl">D</span>
            </div>
            <div>
              <span className="text-xl font-bold text-content-primary">DreamQuest</span>
              <span className="block text-xs text-cyan-400">Administration</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-400 hover:bg-gray-800 hover:text-content-primary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-content-primary font-bold">
              {user?.username?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-content-primary font-medium truncate">{user?.username || "Admin"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-content-primary transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour au site</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}