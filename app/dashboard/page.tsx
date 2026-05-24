"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthContext } from "@/context/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Plus, ChevronDown } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import Loader from "@/components/shared/Loader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardSuggestions from "@/components/dashboard/DashboardSuggestions";

const CharacterList = dynamic(() => import("@/components/character/CharacterList"), {
 ssr: false,
 loading: () => (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-[#131e35] border border-gray-800/50 rounded-xl animate-pulse h-48" />
 ))}
 </div>
 ),
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const {
  stats,
  statsLoading,
  statsError,
  suggestions,
  loadingSuggestions,
  refresh,
  } = useDashboardData(user?.id ?? null);
  const pullDistanceRef = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [pullState, setPullState] = useState<"idle" | "pulling" | "refreshing">("idle");
  const touchStartY = useRef(0);

 const handleTouchStart = (e: React.TouchEvent) => {
 if (window.scrollY <= 0) touchStartY.current = e.touches[0].clientY;
 };
 const handleTouchMove = (e: React.TouchEvent) => {
 if (!touchStartY.current || pullState !== "idle") return;
 const diff = e.touches[0].clientY - touchStartY.current;
 if (diff > 0 && window.scrollY <= 0) {
 const d = Math.min(diff * 0.35, 100);
 pullDistanceRef.current = d;
 setPullState("pulling");
 setPullDistance(d);
 }
 };
  const endPull = () => {
  if (pullDistanceRef.current >= 55) {
  setPullState("refreshing");
  setPullDistance(128);
  refresh();
  } else {
  setPullState("idle");
  setPullDistance(0);
  }
  pullDistanceRef.current = 0;
  touchStartY.current = 0;
  };

  useEffect(() => {
  if (!loading && !user) {
  router.replace("/auth/login");
  }
  }, [loading, user, router]);

  // Auth pas encore pret -> loader bloquant (normal)
 if (loading) {
 return <Loader fullScreen message="Chargement de votre espace..." />;
 }

 if (!user) return null;

 return (
 <div className="min-h-screen bg-[#070b15] text-white flex flex-col">
 <Header />

 <main
 className="flex-1 relative pb-24 md:pb-0"
 onTouchStart={handleTouchStart}
 onTouchMove={handleTouchMove}
 onTouchEnd={endPull}
 >
 {pullState !== "idle" && (
 <div
 className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center overflow-hidden transition-all duration-200"
 style={{ height: pullDistance }}
 >
 {pullState === "refreshing" ? (
 <Loader size="sm" message="" />
 ) : (
 <div className={`transition-transform duration-150 ${pullDistance >= 55 ? "rotate-180" : ""}`}>
 <ChevronDown className="w-6 h-6 text-cyan-400" />
 </div>
 )}
 </div>
 )}

 <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 relative z-10">
 <div className="max-w-7xl mx-auto">
 {/* En-tete */}
 <div className="mb-8 md:mb-10">
 <h1 className="text-2xl md:text-4xl font-bold mb-2">
 Bienvenue,{" "}
 <span className="text-cyan-400">
 {user?.username || "Aventurier"}
 </span>
 </h1>
 <p className="text-gray-400 text-sm md:text-base">
 Prêt à vivre de nouvelles aventures ?
 </p>
 </div>

 {/* Section personnages */}
 <div className="mb-8 md:mb-12">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
 <h2 className="text-xl md:text-2xl font-bold text-white ">
 Mes Personnages
 </h2>
 <button
 onClick={() => router.push("/create-character")}
 className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
 >
 <Plus className="w-5 h-5" />
 Créer un Personnage
 </button>
 </div>
 <CharacterList userId={user.id} />
 </div>

  <DashboardStats stats={stats} loading={statsLoading} error={statsError} />

  <DashboardSuggestions suggestions={suggestions} loading={loadingSuggestions} />
 </div>
 </div>
 </main>

 <BottomNav />
 <Footer />
 </div>
 );
}
