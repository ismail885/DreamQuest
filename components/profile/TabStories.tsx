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

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "À l'instant";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;

  const months = Math.floor(days / 30);
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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
      {CLASSE_ICONS[classe] ?? <User className="w-3.5 h-3.5" />}
      {classe}
    </span>
  );
}

const ITEMS_PER_PAGE = 5;

export default function TabStories({ saves }: TabStoriesProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Regrouper les sauvegardes par aventure : chaque carte montre tous les
  // personnages qui ont sauvegardé cette histoire.
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
          // Le groupe reste "en cours" tant qu'au moins un perso n'a pas terminé.
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

  if (groupedSaves.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Aucune histoire jouée
        </h3>
        <p className="text-gray-400 mb-4">
          Commencez une aventure pour voir votre progression ici.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Découvrir les aventures
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paginatedSaves.map((group) => {
        const characterCount = group.saves.length;
        const characterNames = group.saves.map((s) => s.personnage_nom).filter(Boolean).join(", ");
        return (
          <div
            key={group.adventureId}
            className="backdrop-blur-card bg-slate-900/50 border border-gray-700/30 rounded-xl overflow-hidden"
          >
            {/* En-tête : titre de l'aventure + statut global + personnages */}
            <div className="p-4 border-b border-gray-700/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-base font-semibold text-white truncate">
                      {group.title}
                    </h3>
                    <span
                      className={`flex-shrink-0 px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                        group.status === "completed"
                          ? "border-green-500/50 text-green-400 bg-green-500/10"
                          : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      {group.status === "completed" ? "Terminée" : "En cours"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3 h-3" />
                    <span className="truncate">
                      {characterNames || `${characterCount} personnage${characterCount > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Progression
                  </div>
                  <div className="text-base font-bold text-white">
                    {group.maxProgression}%
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des personnages ayant sauvegardé */}
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
                  className={`group/save flex items-center gap-3 px-4 py-3 transition-all ${
                    idx > 0 ? "border-t border-gray-700/20" : ""
                  } ${
                    save.status === "completed"
                      ? "opacity-75 cursor-default"
                      : "hover:bg-cyan-500/5 cursor-pointer"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium text-white truncate max-w-[160px]">
                        {save.personnage_nom ?? "Personnage"}
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
                      <span className="text-[10px] font-medium text-gray-400 flex-shrink-0 w-8 text-right">
                        {save.progression}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeTime(save.date_sauvegarde)}
                    </div>
                  </div>
                  {save.status !== "completed" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center opacity-0 group-hover/save:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 text-cyan-400 ml-0.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">
            Page {currentPage} / {totalPages} &middot; {groupedSaves.length} histoires
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-700/40 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 text-xs rounded-lg border transition-all ${
                  page === currentPage
                    ? "border-cyan-500/60 bg-cyan-500/20 text-cyan-300 font-semibold"
                    : "border-gray-700/40 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-700/40 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
