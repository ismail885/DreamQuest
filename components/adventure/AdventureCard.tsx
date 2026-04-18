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
        className="group relative bg-[#0f1322] rounded-xl overflow-hidden border border-gray-800/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
      >
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {titre}
          </h3>
          <button
            onClick={handleVoteClick}
            disabled={isLoading}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all flex-shrink-0 ${
              hasVoted
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-yellow-400"
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{currentPopularite}</span>
          </button>
        </div>

        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
          {description ?? "Aucune description disponible."}
        </p>
      </div>
    </Link>
    </motion.div>
  );
}
