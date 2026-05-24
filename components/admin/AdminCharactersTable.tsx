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
  return (
    <div className="bg-[#0c1322] border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Personnage</th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Classe</th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Niveau</th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">PV</th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Propriétaire</th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium text-sm">Actions</th>
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
                  Aucun personnage trouvé
                </td>
              </tr>
            ) : (
              characters.map((character) => (
                <tr key={character.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Sword className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-white font-medium">
                        {character.nom_personnage}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getClassColor(character.classe)}`}>
                      {character.classe}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    {character.niveau}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {character.points_vie} / {character.points_vie_max || 100}
                  </td>
                  <td className="px-6 py-4">
                    {character.nom_utilisateur ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{character.nom_utilisateur}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Inconnu</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(character)}
                        className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => character.id && onDelete(character.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Affichage {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === page
                      ? "bg-cyan-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
