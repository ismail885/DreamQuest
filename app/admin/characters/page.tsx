"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Character } from "@/types";
import { Search, Trash2, ChevronLeft, ChevronRight, Sword, User, X } from "lucide-react";

const ITEMS_PER_PAGE = 10;

interface CharacterWithUser extends Character {
  nom_utilisateur?: string;
}

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<CharacterWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal state
  const [viewCharacter, setViewCharacter] = useState<CharacterWithUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("personnage")
        .select("*", { count: "exact" })
        .order("date_creation", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchTerm) {
        query = query.ilike("nom_personnage", `%${searchTerm}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      // Fetch usernames for each character
      const userIds = [...new Set((data || []).map(c => c.id_utilisateur).filter(Boolean))];
      const { data: users } = await supabase
        .from("utilisateur")
        .select("id_utilisateur, nom_utilisateur")
        .in("id_utilisateur", userIds);

      const userMap = new Map((users || []).map(u => [u.id_utilisateur, u.nom_utilisateur]));
      
      const charactersWithUser = (data || []).map(c => ({
        ...c,
        nom_utilisateur: userMap.get(c.id_utilisateur)
      }));

      setCharacters(charactersWithUser);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  async function handleDelete(characterId: number) {
    try {
      // Delete related saves first
      await supabase.from("sauvegarde").delete().eq("id_personnage", characterId);
      
      const { error } = await supabase
        .from("personnage")
        .delete()
        .eq("id_personnage", characterId);

      if (error) throw error;
      setDeleteConfirm(null);
      fetchCharacters();
    } catch (error) {
      console.error("Error deleting character:", error);
      alert("Erreur lors de la suppression");
    }
  }

  const getClassColor = (classe: string) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des personnages</h1>
          <p className="text-gray-400 mt-2">{totalCount} personnage{totalCount !== 1 ? "s" : ""} créé{totalCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 bg-[#1a1f2e] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl overflow-hidden">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
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
                  <tr key={character.id_personnage} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                          <Sword className="w-5 h-5 text-cyan-400" />
                        </div>
                        <span className="text-white font-medium">{character.nom_personnage}</span>
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
                          <span className="text-gray-300">{character.nom_utilisateur}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Inconnu</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewCharacter(character)}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(character.id_personnage!)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Affichage {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewCharacter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{viewCharacter.nom_personnage}</h2>
              <button onClick={() => setViewCharacter(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-full text-sm border ${getClassColor(viewCharacter.classe)}`}>
                  {viewCharacter.classe}
                </div>
                <div className="text-gray-400">
                  Niveau <span className="text-white font-bold">{viewCharacter.niveau}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <label className="text-gray-400 text-xs">Force</label>
                  <p className="text-white font-bold">{viewCharacter.stats?.force || 0}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Agilité</label>
                  <p className="text-white font-bold">{viewCharacter.stats?.agility || 0}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Intelligence</label>
                  <p className="text-white font-bold">{viewCharacter.stats?.intelligence || 0}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Endurance</label>
                  <p className="text-white font-bold">{viewCharacter.stats?.endurance || 0}</p>
                </div>
              </div>

              {/* Health */}
              <div>
                <label className="text-gray-400 text-sm">Points de vie</label>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">{viewCharacter.points_vie} / {viewCharacter.points_vie_max || 100}</span>
                    <span className="text-gray-400">{Math.round((viewCharacter.points_vie / (viewCharacter.points_vie_max || 100)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (viewCharacter.points_vie / (viewCharacter.points_vie_max || 100)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div>
                <label className="text-gray-400 text-sm">Propriétaire</label>
                <p className="text-white mt-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {viewCharacter.nom_utilisateur || `ID: ${viewCharacter.id_utilisateur}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-400">
                Êtes-vous sûr de vouloir supprimer ce personnage ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}