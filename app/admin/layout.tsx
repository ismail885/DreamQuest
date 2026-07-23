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
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import PageBackground from "@/components/shared/PageBackground";

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { t } = useLanguage();

  const navigation = [
    { name: t("admin.sidebar.dashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("admin.sidebar.logs"), href: "/admin/logs", icon: Activity },
    { name: t("admin.sidebar.users"), href: "/admin/users", icon: Users },
    { name: t("admin.sidebar.adventures"), href: "/admin/adventures", icon: BookOpen },
    { name: t("admin.sidebar.characters"), href: "/admin/characters", icon: UserRound },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-cyan-500/15">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center flex-shrink-0 shadow-glow">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <div className="min-w-0">
            <span className="text-xl font-bold text-white">DreamQuest</span>
            <span className="block text-xs text-primary">{t("admin.sidebar.administration")}</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-card transition-all ${
                active
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-gray-400 border border-transparent hover:bg-cyan-500/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-cyan-500/15">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-glow">
            {user?.username?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{user?.username || "Admin"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-2 px-4">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-3 px-4 py-2 rounded-card text-gray-400 hover:bg-cyan-500/5 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("admin.sidebar.returnToSite")}</span>
          </Link>
          <button
            onClick={() => {
              logout();
              onNavigate?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-card text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("admin.sidebar.logout")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "admin") {
        router.push("/dashboard");
      } else {
        setIsAuthorized(true);
      }
    } else if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep text-white">
      <PageBackground />

      {/* Mobile header with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-card bg-[rgba(7,11,21,0.85)] border-b border-cyan-500/15 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-card bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-sm font-bold text-primary">{t("admin.title")}</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-card text-gray-400 hover:text-white hover:bg-cyan-500/5 transition-colors"
          aria-label={sidebarOpen ? t("common.closeMenu") : t("common.openMenu")}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 backdrop-blur-card bg-[rgba(15,23,42,0.6)] border-r border-cyan-500/20 flex-col z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-72 backdrop-blur-card bg-[rgba(7,11,21,0.95)] border-r border-cyan-500/20 shadow-2xl">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0 relative">
        <div className="p-3 sm:p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
