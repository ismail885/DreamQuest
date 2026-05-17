"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Adventure } from "@/types";
import { Search, Trash2, ChevronLeft, ChevronRight, Eye, Star, Calendar, X, ThumbsUp } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AdminAdventuresPage() {
 const [adventures, setAdventures] = useState<Adventure[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [totalCount, setTotalCount] = useState(0);
 
 // Modal state
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

 const { data, count, error } = await query;

 if (error) throw error;
 setAdventures(data || []);
 setTotalCount(count || 0);
 } catch (error) {
 console.error("Error fetching adventures:", error);
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
 .eq("id_aventure", aventureId);

 if (error) throw error;
 setDeleteConfirm(null);
 fetchAdventures();
 } catch (error) {
 console.error("Error deleting adventure:", error);
 setActionError("Erreur lors de la suppression de l'aventure.");
 setDeleteConfirm(null);
 }
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-white ">Gestion des aventures</h1>
 <p className="text-gray-400 mt-2">{totalCount} aventure{totalCount !== 1 ? "s" : ""} disponible{totalCount !== 1 ? "s" : ""}</p>
 </div>
 <a
 href="/create-adventure"
 className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
 >
 Nouvelle aventure
 </a>
 </div>

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
 <input
 type="text"
 placeholder="Rechercher par titre..."
 value={searchTerm}
 onChange={(e) => {
 setSearchTerm(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full pl-12 pr-4 py-3 bg-[#0c1322] border border-gray-800 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-500"
 />
 </div>

 {/* Error toast */}
 {actionError && (
 <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
 <span className="text-red-400 text-sm flex-1">{actionError}</span>
 <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-300">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* Table */}
 <div className="bg-[#0c1322] border border-gray-800 rounded-xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-900/50 ">
 <tr>
 <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Titre</th>
 <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Description</th>
 <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Popularité</th>
 <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Création</th>
 <th className="px-6 py-4 text-right text-gray-400 font-medium text-sm">Actions</th>
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
 Aucune aventure trouvée
 </td>
 </tr>
 ) : (
 adventures.map((adventure) => (
 <tr key={adventure.id} className="hover:bg-gray-800/30 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
 <Star className="w-5 h-5 text-purple-400" />
 </div>
 <span className="text-white font-medium">{adventure.titre}</span>
 </div>
 </td>
 <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
 {adventure.description || "Sans description"}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <ThumbsUp className="w-4 h-4 text-amber-400" />
 <span className="text-white font-medium">{adventure.popularite}</span>
 </div>
 </td>
 <td className="px-6 py-4 text-gray-400 ">
 {new Date(adventure.date_creation).toLocaleDateString("fr-FR")}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => setViewAdventure(adventure)}
 className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
 title="Voir"
 >
 <Eye className="w-4 h-4" />
 </button>
 <button
 onClick={() => setDeleteConfirm(adventure.id)}
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
 {viewAdventure && (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-[#0c1322] border border-gray-800 rounded-xl w-full max-w-lg">
 <div className="flex items-center justify-between p-6 border-b border-gray-800 ">
 <h2 className="text-xl font-bold text-white ">{viewAdventure.titre}</h2>
 <button onClick={() => setViewAdventure(null)} className="text-gray-400 hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-6 space-y-4">
 <div>
 <label className="text-gray-400 text-sm">Description</label>
 <p className="text-white mt-1">{viewAdventure.description || "Aucune description"}</p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-gray-400 text-sm">Popularité</label>
 <p className="text-white mt-1 flex items-center gap-2">
 <ThumbsUp className="w-4 h-4 text-amber-400" />
 {viewAdventure.popularite}
 </p>
 </div>
 <div>
 <label className="text-gray-400 text-sm">Date de création</label>
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
 className="block w-full px-4 py-3 bg-cyan-500 text-white text-center rounded-lg hover:bg-cyan-600 transition-colors"
 >
 Voir l&apos;aventure
 </a>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {deleteConfirm && (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-[#0c1322] border border-gray-800 rounded-xl w-full max-w-sm">
 <div className="p-6 text-center">
 <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
 <Trash2 className="w-8 h-8 text-red-400" />
 </div>
 <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
 <p className="text-gray-400 ">
 Êtes-vous sûr de vouloir supprimer cette aventure ? Cette action est irréversible.
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

