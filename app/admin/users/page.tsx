"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, UserRole } from "@/types";
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, CheckSquare, Square, Eye, BookOpen, UserRound } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [userCharacters, setUserCharacters] = useState<{ id: number; nom_personnage: string; classe: string; niveau: number }[]>([]);
  const [userSavesCount, setUserSavesCount] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nom_utilisateur: "",
    email: "",
    role: "joueur" as UserRole,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("utilisateur")
        .select("*", { count: "exact" })
        .order("date_creation", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (searchTerm) {
        query = query.or(`nom_utilisateur.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;
      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id!).filter(Boolean)));
    }
  };

  const toggleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedUsers.size} utilisateurs ? Cette action est irréversible.`)) return;
    try {
      for (const userId of selectedUsers) {
        await supabase.from("vote").delete().eq("id_utilisateur", userId);
        await supabase.from("sauvegarde").delete().eq("id_utilisateur", userId);
        await supabase.from("personnage").delete().eq("id_utilisateur", userId);
        await supabase.from("utilisateur").delete().eq("id", userId);
      }
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error("Error deleting users:", error);
      setActionError("Erreur lors de la suppression des utilisateurs.");
    }
  };

  const handleBulkRoleChange = async (newRole: UserRole) => {
    try {
      for (const userId of selectedUsers) {
        await supabase.from("utilisateur").update({ role: newRole }).eq("id", userId);
      }
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error("Error updating roles:", error);
      setActionError("Erreur lors du changement de rôle.");
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role as UserRole,
      });
    } else {
      setEditingUser(null);
      setFormData({ nom_utilisateur: "", email: "", role: "joueur" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ nom_utilisateur: "", email: "", role: "joueur" });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingUser) {
        const { error } = await supabase
          .from("utilisateur")
          .update({
            nom_utilisateur: formData.nom_utilisateur,
            email: formData.email,
            role: formData.role,
          })
          .eq("id", editingUser.id);

        if (error) throw error;
      } else {
        // For new users, we'd need to handle password - simplified for admin
        setActionError("La création d'utilisateur via admin nécessite le formulaire d'inscription.");
        return;
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      setActionError("Erreur lors de la sauvegarde de l'utilisateur.");
    }
  }

  async function handleDelete(userId: number) {
    try {
      // Delete related records first
      await supabase.from("vote").delete().eq("id_utilisateur", userId);
      await supabase.from("sauvegarde").delete().eq("id_utilisateur", userId);
      await supabase.from("personnage").delete().eq("id_utilisateur", userId);
      
      const { error } = await supabase
        .from("utilisateur")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setActionError("Erreur lors de la suppression de l'utilisateur.");
      setDeleteConfirm(null);
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-red-500/20 text-red-400 border-red-500/30",
      createur: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      joueur: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    };
    const labels = { admin: "Admin", createur: "Créateur", joueur: "Joueur" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[role as keyof typeof styles] || styles.joueur}`}>
        {labels[role as keyof typeof labels] || "Joueur"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>
          <p className="text-gray-400 mt-2">{totalCount} utilisateur{totalCount !== 1 ? "s" : ""} enregistré{totalCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 bg-[#0f1623] border border-gray-800 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-500"
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

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg mb-4">
          <span className="text-white font-medium">{selectedUsers.size} sélectionné{selectedUsers.size > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkRoleChange("joueur")}
              className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-sm"
            >
              Passer en Joueur
            </button>
            <button
              onClick={() => handleBulkRoleChange("createur")}
              className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm"
            >
              Passer en Créateur
            </button>
            <button
              onClick={() => handleBulkRoleChange("admin")}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
            >
              Passer en Admin
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
            >
              Supprimer
            </button>
          </div>
          <button onClick={() => setSelectedUsers(new Set())} className="ml-auto text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0f1623] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-4 text-left text-gray-400 font-medium text-sm w-12">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-white">
                    {selectedUsers.size === users.length && users.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Utilisateur</th>
                <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Email</th>
                <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Rôle</th>
                <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">Inscription</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <button onClick={() => user.id && toggleSelectUser(user.id)} className="text-gray-400 hover:text-white">
                        {selectedUsers.has(user.id!) ? (
                          <CheckSquare className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                          {user.nom_utilisateur.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{user.nom_utilisateur}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.date_creation).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDetailUser(user);
                            setDetailLoading(true);
                            Promise.all([
                              supabase.from("personnage").select("id, nom_personnage, classe, niveau").eq("id_utilisateur", user.id),
                              supabase.from("sauvegarde").select("id", { count: "exact", head: true }).eq("id_utilisateur", user.id),
                            ]).then(([chars, saves]) => {
                              setUserCharacters(chars.data || []);
                              setUserSavesCount(saves.count || 0);
                              setDetailLoading(false);
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Voir details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
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

      {detailUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1623] border border-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-[#0f1623]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  {detailUser.nom_utilisateur.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{detailUser.nom_utilisateur}</h2>
                  <p className="text-gray-400 text-sm">{detailUser.email}</p>
                </div>
              </div>
              <button onClick={() => setDetailUser(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Role</p>
                  <p className="text-white font-medium">{detailUser.role}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Inscription</p>
                  <p className="text-white font-medium">{new Date(detailUser.date_creation).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <UserRound className="w-5 h-5 text-cyan-400" />
                  Personnages ({userCharacters.length})
                </h3>
                {detailLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-cyan-500 mx-auto"></div>
                ) : userCharacters.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun personnage</p>
                ) : (
                  <div className="space-y-2">
                    {userCharacters.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div>
                          <span className="text-white font-medium">{c.nom_personnage}</span>
                          <span className="text-gray-400 text-sm ml-2">({c.classe})</span>
                        </div>
                        <span className="text-cyan-400 text-sm">Niveau {c.niveau}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400">{userSavesCount} sauvegarde{userSavesCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1623] border border-gray-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingUser ? "Modifier l&apos;utilisateur" : "Nouvel utilisateur"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nom d&apos;utilisateur</label>
                <input
                  type="text"
                  value={formData.nom_utilisateur}
                  onChange={(e) => setFormData({ ...formData, nom_utilisateur: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="joueur">Joueur</option>
                  <option value="createur">Créateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1623] border border-gray-800 rounded-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-400">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
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