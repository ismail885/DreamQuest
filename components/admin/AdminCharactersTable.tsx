"use client";

import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sword,
  User,
} from "lucide-react";
import type { CharacterWithUser } from "@/hooks/admin/useAdminCharacters";
import { useLanguage } from "@/context/LanguageContext";

const ITEMS_PER_PAGE = 10;

interface AdminCharactersTableProps {
  characters: CharacterWithUser[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onView: (character: CharacterWithUser) => void;
  onDelete: (id: number) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

function getClassColor(classe: string) {
  const colors: Record<string, string> = {
    Guerrier: "bg-red-500/20 text-red-400 border-red-500/30",
    Mage: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Assassin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Prêtre: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Paladin: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Archer: "bg-green-500/20 text-green-400 border-green-500/30",
    Druide: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Nécromancien: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    Voleur: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Barbare: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };
  return colors[classe] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
}

export default function AdminCharactersTable({
  characters,
  loading,
  totalCount,
  totalPages,
  currentPage,
  onView,
  onDelete,
  setCurrentPage,
}: AdminCharactersTableProps) {
  const { t } = useLanguage();
  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">{t("admin.tables.character")}</th>
              <th className="px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">{t("admin.tables.class")}</th>
              <th className="px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">{t("admin.tables.level")}</th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">{t("admin.tables.hp")}</th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">{t("admin.tables.owner")}</th>
              <th className="px-3 sm:px-6 py-4 text-right text-gray-300 font-medium text-xs sm:text-sm">{t("admin.tables.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto" />
                </td>
              </tr>
            ) : characters.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  {t("admin.tables.noCharacters")}
                </td>
              </tr>
            ) : (
              characters.map((character) => (
                <tr key={character.id} className="hover:bg-cyan-500/10/30 transition-colors">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-card bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Sword className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      </div>
                      <span className="text-white font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                        {character.nom_personnage}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs border ${getClassColor(character.classe)}`}>
                      {character.classe}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-white font-medium text-sm sm:text-base">
                    {character.niveau}
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-gray-400 text-sm">
                    {character.points_vie} / {character.points_vie_max || 100}
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                    {character.nom_utilisateur ? (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-400 text-sm">{character.nom_utilisateur}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">{t("admin.tables.unknown")}</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => onView(character)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-card transition-colors"
                        title={t("admin.actions.view")}
                      >
                        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => character.id && onDelete(character.id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-card transition-colors"
                        title={t("admin.actions.delete")}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-4 border-t border-cyan-500/15">
          <p className="text-gray-400 text-xs sm:text-sm">
            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur {totalCount}
          </p>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1 rounded-card text-xs sm:text-sm ${
                    currentPage === page
                      ? "bg-cyan-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-cyan-500/10"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
