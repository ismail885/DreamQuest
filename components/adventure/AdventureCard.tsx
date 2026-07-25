"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useVote } from "@/hooks/useVote";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { updateQuestProgress } from "@/lib/dailyQuests";
import { GENRE_LABELS, GENRE_COLORS } from "@/hooks/useAdventureList";
import { getGenreImage, getFallbackImage } from "@/data/adventureImages";

interface AdventureCardProps {
  id: number;
  titre: string;
  description: string | null;
  popularite: number;
  personnageId?: string;
  onNavigateWithoutCharacter?: () => void;
  index?: number;
  genre?: string | null;
}

const easeOutQuart = [0.25, 1, 0.5, 1] as const;

const AdventureCard = React.memo(function AdventureCard({
  id,
  titre,
  description,
  popularite,
  personnageId,
  onNavigateWithoutCharacter,
  index = 0,
  genre,
}: AdventureCardProps) {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const [initialVoted, setInitialVoted] = useState(false);

  useEffect(() => {
    const checkVote = async () => {
      if (!user || !user.id) return;
      const userId = Number(user.id);
      if (isNaN(userId)) return;
      const { data } = await supabase
        .from("vote")
        .select("id")
        .eq("id_utilisateur", userId)
        .eq("id_aventure", id)
        .maybeSingle();
      setInitialVoted(!!data);
    };
    checkVote();
  }, [user, id]);

  const {
    hasVoted,
    popularite: currentPopularite,
    isLoading,
    error: voteError,
    toggleVote,
  } = useVote({
    adventureId: id,
    userId: user?.id ? Number(user.id) : null,
    initialHasVoted: initialVoted,
    initialPopularite: popularite,
  });

  // Afficher une toast quand une erreur de vote survient
  useEffect(() => {
    if (voteError) {
      toast.error(voteError);
    }
  }, [voteError]);

  const href = personnageId
    ? `/adventure/${id}?personnage=${personnageId}`
    : `/adventure/${id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    if (!personnageId && onNavigateWithoutCharacter) {
      e.preventDefault();
      onNavigateWithoutCharacter();
    }
  };

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(t("adventure.vote.notLoggedIn"));
      return;
    }
    const success = await toggleVote();
    if (!success) return; // Ne pas bumpVote si le vote a échoué
    const uid = user.id;
    const bumpVote = (questId: string) =>
      updateQuestProgress(uid, questId, 1).then((r) => {
        if (r.completion) {
          toast.success(`Quête terminée : ${r.completion.questId} (+${r.completion.xpAwarded} XP)`);
        }
        window.dispatchEvent(new CustomEvent("profile-refresh"));
      }).catch((err) => console.error("[Quest] update vote_3 failed:", err));
    bumpVote("vote_1");
    bumpVote("vote_3");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: easeOutQuart }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={personnageId ? href : "#"}
        onClick={!personnageId ? handleCardClick : undefined}
        className="group relative backdrop-blur-card bg-deep rounded-card overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 block "
      >
        {/* Image thematique par genre (LoremFlickr, gratuit) */}
        <div className="relative w-full h-32 overflow-hidden bg-slate-900/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getGenreImage(genre, id)}
            alt=""
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallback) {
                img.style.visibility = "hidden";
                return;
              }
              img.dataset.fallback = "1";
              img.src = getFallbackImage(id);
            }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/40 to-transparent" />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-bold text-base leading-tight group-hover:text-primary transition-colors flex-1 ">
              {titre}
            </h3>
            {genre && GENRE_LABELS[genre] && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${
                  GENRE_COLORS[genre] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"
                }`}
              >
                {GENRE_LABELS[genre]}
              </span>
            )}
          </div>

          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed ">
            {description ?? t("adventure.noDescription")}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-cyan-500/15 ">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs ">
              <Star className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{currentPopularite}</span>
            </div>

            <button
              onClick={handleVoteClick}
              disabled={isLoading}
              aria-label={hasVoted ? t("adventure.vote.remove") : t("adventure.vote.add")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 ${
                hasVoted
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50 hover:text-yellow-400 hover:border-yellow-500/30"
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${hasVoted ? "fill-yellow-400" : ""}`}
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{currentPopularite}</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default AdventureCard;
