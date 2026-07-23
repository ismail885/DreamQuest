"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Adventure } from "@/types";
import { Search, Trash2, ChevronLeft, ChevronRight, Eye, Star, Calendar, X, ThumbsUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ITEMS_PER_PAGE = 10;

export default function AdminAdventuresPage() {
  const { t } = useLanguage();
 const [adventures, setAdventures] = useState<Adventure[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [totalCount, setTotalCount] = useState(0);
 
 const [viewAdventure, setViewAdventure] = useState<Adventure | null>(null);
 const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
 const [actionError, setActionError] = useState<string | null>(null);

  const fetchAdventures = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("aventure")
        .select("*", { count: "exact" })
        .order("date_creation", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchTerm) {
        query = query.ilike("titre", `%${searchTerm}%`);
      }

      const { data, count } = await query;

      setAdventures(data || []);
      setTotalCount(count || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

 useEffect(() => {
 fetchAdventures();
 }, [fetchAdventures]);

 const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  async function handleDelete(aventureId: number) {
    try {
      // Delete related records first
      await supabase.from("vote").delete().eq("id_aventure", aventureId);
      await supabase.from("sauvegarde").delete().eq("id_aventure", aventureId);
      await supabase.from("embranchement").delete().eq("id_aventure", aventureId);

      const { error } = await supabase
        .from("aventure")
        .delete()
        .eq("id", aventureId);

      if (error) throw error;
      setDeleteConfirm(null);
      fetchAdventures();
    } catch {
      setActionError(t("admin.errorDelete"));
      setDeleteConfirm(null);
    }
  }

 return (
 <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("admin.adventuresManagement")}</h1>
          <p className="text-gray-400 mt-2">{totalCount} {t("admin.management.adventuresCount")}</p>
        </div>
        <a
          href="/create-adventure"
          className="self-start px-5 py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:shadow-glow text-white font-medium rounded-card transition-colors text-sm sm:text-base whitespace-nowrap"
        >
          {t("admin.actions.newAdventure")}
        </a>
      </div>

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
 <input
 type="text"
  aria-label={t("admin.tables.searchAdventures")}
  placeholder={t("admin.tables.searchAdventures")}
 value={searchTerm}
 onChange={(e) => {
 setSearchTerm(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full pl-12 pr-4 py-3 card-base text-white placeholder:text-gray-400 focus:outline-none focus:border-primary"
 />
 </div>

 {/* Error toast */}
 {actionError && (
 <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-card">
 <span className="text-red-400 text-sm flex-1">{actionError}</span>
 <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-300">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* Table */}
 <div className="card-base overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-left text-gray-400 font-medium text-sm">Titre</th>
              <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-gray-400 font-medium text-sm">{t("admin.tables.description")}</th>
              <th className="px-4 sm:px-6 py-4 text-left text-gray-400 font-medium text-sm">{t("admin.tables.popularity")}</th>
              <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left text-gray-400 font-medium text-sm">{t("admin.tables.creationDate")}</th>
              <th className="px-4 sm:px-6 py-4 text-right text-gray-400 font-medium text-sm">{t("admin.tables.actions")}</th>
            </tr>
          </thead>
 <tbody className="divide-y divide-gray-800 ">
 {loading ? (
 <tr>
 <td colSpan={5} className="px-6 py-12 text-center text-gray-400 ">
 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
 </td>
 </tr>
 ) : adventures.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-6 py-12 text-center text-gray-400 ">
  {t("admin.tables.noAdventures")}
  </td>
 </tr>
 ) : (
              adventures.map((adventure) => (
                <tr key={adventure.id} className="hover:bg-cyan-500/10/30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-card bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      </div>
                      <span className="text-white font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{adventure.titre}</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-gray-400 max-w-xs truncate text-sm">
                    {adventure.description || t("admin.tables.noDescription")}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      <span className="text-white font-medium text-sm sm:text-base">{adventure.popularite}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-gray-400 text-sm">
                    {new Date(adventure.date_creation).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => setViewAdventure(adventure)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-card transition-colors"
                        title={t("admin.actions.view")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(adventure.id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-card transition-colors"
                        title={t("admin.actions.delete")}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-4 border-t border-cyan-500/15">
          <p className="text-gray-400 text-xs sm:text-sm">
            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur {totalCount}
          </p>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
 </div>

 {/* View Modal */}
 {viewAdventure && (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="card-base w-full max-w-lg">
 <div className="flex items-center justify-between p-6 border-b border-cyan-500/15 ">
 <h2 className="text-xl font-bold text-white ">{viewAdventure.titre}</h2>
 <button onClick={() => setViewAdventure(null)} className="text-gray-400 hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-6 space-y-4">
 <div>
  <label className="text-gray-400 text-sm">{t("admin.tables.description")}</label>
  <p className="text-white mt-1">{viewAdventure.description || t("admin.tables.noDescription")}</p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
  <label className="text-gray-400 text-sm">{t("admin.tables.popularity")}</label>
 <p className="text-white mt-1 flex items-center gap-2">
 <ThumbsUp className="w-4 h-4 text-amber-400" />
 {viewAdventure.popularite}
 </p>
 </div>
 <div>
  <label className="text-gray-400 text-sm">{t("admin.tables.creationDate")}</label>
 <p className="text-white mt-1 flex items-center gap-2">
 <Calendar className="w-4 h-4 text-cyan-400" />
 {new Date(viewAdventure.date_creation).toLocaleDateString("fr-FR")}
 </p>
 </div>
 </div>
 {viewAdventure.auteur_id && (
 <div>
 <label className="text-gray-400 text-sm">ID Auteur</label>
 <p className="text-white mt-1">#{viewAdventure.auteur_id}</p>
 </div>
 )}
 </div>
 <div className="p-6 pt-0">
 <a
 href={`/adventure/${viewAdventure.id}`}
 className="block w-full px-4 py-3 bg-cyan-500 text-white text-center rounded-card hover:bg-cyan-600 transition-colors"
 >
  {t("admin.actions.viewAdventure")}
 </a>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {deleteConfirm && (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="card-base w-full max-w-sm">
 <div className="p-6 text-center">
 <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
 <Trash2 className="w-8 h-8 text-red-400" />
 </div>
  <h3 className="text-xl font-bold text-white mb-2">{t("admin.confirmDeleteAdventure")}</h3>
  <p className="text-gray-400 ">
  {t("admin.confirmDeleteAdventureDesc")}
  </p>
 </div>
 <div className="flex gap-3 p-6 pt-0">
 <button
 onClick={() => setDeleteConfirm(null)}
 className="flex-1 px-4 py-3 border border-cyan-500/15 text-gray-400 rounded-card hover:bg-cyan-500/10 transition-colors"
 >
  {t("admin.actions.cancel")}
  </button>
  <button
  onClick={() => handleDelete(deleteConfirm)}
  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-card hover:bg-red-600 transition-colors"
  >
  {t("admin.actions.delete")}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

