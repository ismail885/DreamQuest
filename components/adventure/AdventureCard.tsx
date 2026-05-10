"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useVote } from "@/hooks/useVote";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface AdventureCardProps {
  id: number;
  titre: string;
  description: string | null;
  popularite: number;
  personnageId?: string;
}

export default function AdventureCard({
  id,
  titre,
  description,
  popularite,
  personnageId,
}: AdventureCardProps) {
  const { user } = useAuthContext();
  const [initialVoted, setInitialVoted] = useState(false);

  useEffect(() => {
    const checkVote = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("vote")
        .select("id_vote")
        .eq("id_utilisateur", user.id)
        .eq("id_aventure", id)
        .maybeSingle();
      setInitialVoted(!!data);
    };
    checkVote();
  }, [user, id]);

  const { hasVoted, popularite: currentPopularite, isLoading, toggleVote } = useVote({
    adventureId: id,
    userId: user?.id ?? null,
    initialHasVoted: initialVoted,
    initialPopularite: popularite,
  });

  const href = personnageId
    ? `/adventure/${id}?personnage=${personnageId}`
    : `/adventure/${id}`;

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Vous devez être connecté pour voter");
      return;
    }
    await toggleVote();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className="group relative bg-[#0f1322] rounded-xl overflow-hidden border border-gray-800/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 block"
      >
        {/* Gradient header */}
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
        
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Icon */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-bold text-lg line-clamp-1 group-hover:text-cyan-400 transition-colors">
                {titre}
              </h3>
            </div>
            
            {/* Vote button */}
            <button
              onClick={handleVoteClick}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                hasVoted
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50 hover:text-yellow-400 hover:border-yellow-500/30"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold">{currentPopularite}</span>
            </button>
          </div>

          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {description ?? "Aucune description disponible."}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Aventure
            </span>
            <span className="text-cyan-400 text-xs font-medium group-hover:translate-x-1 transition-transform">
              Commencer →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
