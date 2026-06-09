"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";
import { GENRE_LABELS, GENRE_COLORS } from "@/hooks/useAdventureList";

interface DashboardSuggestionsProps {
  suggestions: { id: number; titre: string; description: string | null; genre?: string | null }[];
  loading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function DashboardSuggestions({
  suggestions,
  loading,
}: DashboardSuggestionsProps) {
  const router = useRouter();

  // Skeleton pendant le chargement
  if (loading) {
    return (
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 sticky top-16 md:top-20 z-20 bg-deep/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Pour Vous
        </h2>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#0d1526] to-[#131929] border border-yellow-500/20 rounded-xl p-5 animate-pulse"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-700/50 mb-3" />
              <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-700/50 rounded w-full mb-2" />
              <div className="h-4 bg-gray-700/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 sticky top-16 md:top-20 z-20 bg-deep/80 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 -mt-3 md:-mt-4">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        Pour Vous
      </h2>

      {suggestions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="bg-gradient-to-br from-[#0d1526] to-[#131929] border border-yellow-500/20 rounded-xl p-8 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Compass className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-white font-medium mb-1">
            Vous avez tout exploré !
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Aucune nouvelle suggestion pour l&apos;instant. Découvrez toutes les aventures disponibles.
          </p>
          <button
            onClick={() => router.push("/adventure")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-300 ease-out hover:scale-102 active:scale-98"
          >
            <Compass className="w-4 h-4" />
            Explorer les aventures
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="grid md:grid-cols-3 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {suggestions.map((adventure) => (
            <motion.div
              key={adventure.id}
              variants={cardVariants}
              whileHover={{
                y: -6,
                transition: {
                  duration: 0.3,
                  ease: [0.25, 1, 0.5, 1] as const,
                },
              }}
              onClick={() => router.push(`/adventure/${adventure.id}`)}
              className="bg-gradient-to-br from-[#0d1526] to-[#131929] border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl p-5 transition-colors duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                  Recommande
                </span>
                {adventure.genre && GENRE_LABELS[adventure.genre] && (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      GENRE_COLORS[adventure.genre] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }`}
                  >
                    {GENRE_LABELS[adventure.genre]}
                  </span>
                )}
              </div>
              <h3 className="text-white font-semibold mb-2 line-clamp-1 group-hover:text-yellow-100 transition-colors">
                {adventure.titre}
              </h3>
              <p className="text-gray-300 text-sm line-clamp-2">
                {adventure.description || "Une aventure palpitante vous attend..."}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

