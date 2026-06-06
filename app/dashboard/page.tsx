"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthContext } from "@/context/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Plus, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import PageTransition from "@/components/shared/PageTransition";
import Loader from "@/components/shared/Loader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardSuggestions from "@/components/dashboard/DashboardSuggestions";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const CharacterList = dynamic(() => import("@/components/character/CharacterList"), {
 ssr: false,
 loading: () => (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-surface-card border border-gray-800/50 rounded-xl animate-pulse h-48" />
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
  const { pullDistance, pullState, handleTouchStart, handleTouchMove, handleTouchEnd } =
  usePullToRefresh(refresh);

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
 <div className="min-h-screen bg-deep text-white flex flex-col">
 <Header />

 <main
 className="flex-1 relative pb-24 md:pb-0"
 onTouchStart={handleTouchStart}
 onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
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

  <PageTransition className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 relative z-10">
  <div className="max-w-7xl mx-auto">
  {/* En-tete */}
 <motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="mb-8 md:mb-10"
 >
 <motion.h1
  variants={fadeInUp}
  className="text-2xl md:text-4xl font-bold mb-2"
 >
 Bienvenue,{" "}
 <span className="text-cyan-400">
 {user?.username || "Aventurier"}
 </span>
 </motion.h1>
 <motion.p
  variants={fadeInUp}
  className="text-gray-300 text-sm md:text-base"
 >
 Prêt à vivre de nouvelles aventures ?
 </motion.p>
 </motion.div>

  {/* Section personnages */}
 <motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="mb-8 md:mb-12"
 >
 <motion.div
  variants={fadeInUp}
  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6"
 >
 <h2 className="text-xl md:text-2xl font-bold text-white ">
 Mes Personnages
 </h2>
 <button
 onClick={() => router.push("/create-character")}
 className="group w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 ease-out hover:scale-102 active:scale-98 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
 >
 <Plus className="w-5 h-5 transition-transform duration-300 ease-out group-hover:rotate-90" />
 Créer un Personnage
 </button>
 </motion.div>
 <motion.div variants={fadeInUp}>
 <CharacterList userId={user.id} />
 </motion.div>
 </motion.div>

  <motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
 >
 <DashboardStats stats={stats} loading={statsLoading} error={statsError} />
 </motion.div>

  <motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
  transition={{ delay: 0.2 }}
 >
 <DashboardSuggestions suggestions={suggestions} loading={loadingSuggestions} />
 </motion.div>
  </div>
  </PageTransition>
  </main>

  <BottomNav />
  <Footer />
  </div>
  );
}

