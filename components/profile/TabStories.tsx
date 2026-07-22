"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Play,
  Sword,
  Wand2,
  Shield,
  Wind,
  User,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { UserSave } from "@/types/save";
import { useLanguage } from "@/context/LanguageContext";
import type { Lang } from "@/lib/i18n/types";

interface TabStoriesProps {
  saves: UserSave[];
}

interface AdventureGroup {
  adventureId: number;
  title: string;
  status: "completed" | "in-progress";
  maxProgression: number;
  saves: UserSave[];
}

function getRelativeTime(dateStr: string, lang: Lang): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return lang === "en" ? "Just now" : "À l'instant";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return lang === "en" ? "Just now" : "À l'instant";
  if (minutes < 60) {
    return lang === "en" ? `${minutes} min ago` : `Il y a ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return lang === "en" ? `${hours}h ago` : `Il y a ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    if (lang === "en") return `${days} day${days > 1 ? "s" : ""} ago`;
    return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  }

  const months = Math.floor(days / 30);
  if (lang === "en") return `${months} month${months > 1 ? "s" : ""} ago`;
  return `Il y a ${months} mois`;
}

const CLASSE_ICONS: Record<string, React.ReactNode> = {
  Guerrier: <Sword className="w-3.5 h-3.5" />,
  Barbare: <Sword className="w-3.5 h-3.5" />,
  Mage: <Wand2 className="w-3.5 h-3.5" />,
  Prêtre: <Wand2 className="w-3.5 h-3.5" />,
  Druide: <Wand2 className="w-3.5 h-3.5" />,
  Archer: <Wind className="w-3.5 h-3.5" />,
  Assassin: <Wind className="w-3.5 h-3.5" />,
  Voleur: <Wind className="w-3.5 h-3.5" />,
  Paladin: <Shield className="w-3.5 h-3.5" />,
  Nécromancien: <Wand2 className="w-3.5 h-3.5" />,
};

function ClasseBadge({ classe }: { classe?: string }) {
  if (!classe) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full whitespace-nowrap">
      {CLASSE_ICONS[classe] ?? <User className="w-3.5 h-3.5" />}
      {classe}
    </span>
  );
}

/**
 * Génère la liste des numéros de page à afficher avec des "..." pour les trous.
 * Ex: [1, "...", 4, 5, 6, "...", 12]
 */
function getPageRange(
  current: number,
  total: number,
  siblings = 1,
): (number | "...")[] {
  if (total <= 1) return [1];

  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);
  const pages: (number | "...")[] = [1];

  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  if (total > 1) pages.push(total);

  return pages;
}

const ITEMS_PER_PAGE = 5;

export default function TabStories({ saves }: TabStoriesProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);

  const groupedSaves = useMemo<AdventureGroup[]>(() => {
    const map = new Map<number, AdventureGroup>();

    [...saves]
      .sort(
        (a, b) =>
          new Date(b.date_sauvegarde).getTime() -
          new Date(a.date_sauvegarde).getTime(),
      )
      .forEach((save) => {
        const existing = map.get(save.id_aventure);
        if (!existing) {
          map.set(save.id_aventure, {
            adventureId: save.id_aventure,
            title: save.aventure_titre,
            status: save.status,
            maxProgression: save.progression,
            saves: [save],
          });
        } else {
          existing.saves.push(save);
          if (save.progression > existing.maxProgression) {
            existing.maxProgression = save.progression;
          }
          if (existing.status === "completed" && save.status !== "completed") {
            existing.status = "in-progress";
          }
        }
      });

    return Array.from(map.values());
  }, [saves]);

  const totalPages = Math.ceil(groupedSaves.length / ITEMS_PER_PAGE);
  const paginatedSaves = groupedSaves.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const pageRange = getPageRange(currentPage, totalPages);

  if (groupedSaves.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {t("profile.noStories")}
        </h3>
        <p className="text-gray-400 mb-4 text-sm">
          {t("profile.noStoriesDesc")}
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 active:scale-95 text-white font-medium rounded-lg transition-all touch-manipulation"
        >
          {t("profile.discoverAdventures")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paginatedSaves.map((group) => {
        const characterCount = group.saves.length;
        const characterNames = group.saves
          .map((s) => s.personnage_nom)
          .filter(Boolean)
          .join(", ");

        return (
          <div
            key={group.adventureId}
            className="backdrop-blur-card bg-slate-900/50 border border-gray-700/30 rounded-xl overflow-hidden"
          >
            {/* En-tête : titre de l'aventure + statut + progression */}
            <div className="p-3 sm:p-4 border-b border-gray-700/30">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate max-w-[160px] xs:max-w-none">
                      {group.title}
                    </h3>
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        group.status === "completed"
                          ? "border-green-500/50 text-green-400 bg-green-500/10"
                          : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      {group.status === "completed" ? t("profile.completed") : t("profile.inProgress")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {characterNames ||
                        `${characterCount} ${t("profile.stats.characters").toLowerCase()}`}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                    {t("profile.progression")}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {group.maxProgression}%
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des personnages */}
            <div className="bg-slate-950/30">
              {group.saves.map((save, idx) => (
                <div
                  key={save.id}
                  onClick={() =>
                    save.status !== "completed" &&
                    router.push(
                      `/adventure/${save.id_aventure}?personnage=${save.id_personnage}&save=${save.id}`,
                    )
                  }
                  className={`group/save flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 transition-all touch-manipulation ${
                    idx > 0 ? "border-t border-gray-700/20" : ""
                  } ${
                    save.status === "completed"
                      ? "opacity-75 cursor-default"
                      : "hover:bg-cyan-500/5 active:bg-cyan-500/10 cursor-pointer"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>

                  {/* Nom + barre de progression */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="text-sm font-medium text-white truncate max-w-[100px] sm:max-w-[180px]">
                        {save.personnage_nom ?? t("character.name")}
                      </span>
                      <ClasseBadge classe={save.personnage_classe} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            save.status === "completed"
                              ? "bg-gradient-to-r from-cyan-500 to-green-500"
                              : "bg-gradient-to-r from-cyan-500 to-blue-500"
                          }`}
                          style={{ width: `${save.progression}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 flex-shrink-0 w-7 text-right">
                        {save.progression}%
                      </span>
                    </div>
                  </div>

                  {/* Timestamp — masqué sur très petit écran */}
                  <div className="hidden xs:flex flex-shrink-0 text-right">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeTime(save.date_sauvegarde, lang)}
                    </div>
                  </div>

                  {/* Bouton play — toujours visible sur touch, hover sur desktop */}
                  {save.status !== "completed" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center transition-opacity opacity-100 sm:opacity-0 sm:group-hover/save:opacity-100">
                      <Play className="w-3 h-3 text-cyan-400 ml-0.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-2">
          {/* Compteur */}
          <span className="text-xs text-gray-500 order-2 xs:order-1">
            {t("profile.pageInfo")
              .replace("{current}", String(currentPage))
              .replace("{total}", String(totalPages))
              .replace("{count}", String(groupedSaves.length))}
          </span>

          {/* Boutons */}
          <div className="flex items-center gap-1 order-1 xs:order-2 flex-wrap justify-center">
            {/* Précédent */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label={t("profile.previousPage")}
              className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-gray-700/40 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numéros de page avec ellipsis */}
            {pageRange.map((page, i) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 text-xs text-gray-500 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-label={t("profile.goToPage").replace("{page}", String(page))}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 text-xs rounded-lg border transition-all active:scale-95 touch-manipulation ${
                    page === currentPage
                      ? "border-cyan-500/60 bg-cyan-500/20 text-cyan-300 font-semibold"
                      : "border-gray-700/40 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            {/* Suivant */}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              aria-label={t("profile.nextPage")}
              className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-gray-700/40 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all touch-manipulation"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
