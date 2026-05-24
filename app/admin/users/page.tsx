"use client";

import { Search, X } from "lucide-react";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import UserDetailModal from "@/components/admin/UserDetailModal";
import UserEditModal from "@/components/admin/UserEditModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function AdminUsersPage() {
 const {
 users, loading, searchTerm, currentPage, totalCount, totalPages,
 selectedUsers, actionError,
 detailUser, userCharacters, userSavesCount, detailLoading,
 isModalOpen, editingUser, formData, deleteConfirm,
 setSearchTerm, setCurrentPage, setDetailUser, setFormData,
 setActionError, setDeleteConfirm, fetchUsers,
 toggleSelectAll, toggleSelectUser,
 handleBulkDelete, handleBulkRoleChange,
 openModal, closeModal, handleSubmit, handleDelete,
 loadUserDetails,
 } = useAdminUsers();

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-white ">Gestion des utilisateurs</h1>
 <p className="text-gray-400 mt-2">{totalCount} utilisateur{totalCount !== 1 ? "s" : ""} enregistré{totalCount !== 1 ? "s" : ""}</p>
 </div>
 </div>

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
 <input
 type="text"
 placeholder="Rechercher par nom ou email..."
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
 <AdminUsersTable
 users={users}
 loading={loading}
 selectedUsers={selectedUsers}
 totalCount={totalCount}
 totalPages={totalPages}
 currentPage={currentPage}
 toggleSelectAll={toggleSelectAll}
 toggleSelectUser={toggleSelectUser}
 openModal={openModal}
 loadUserDetails={loadUserDetails}
 setDeleteConfirm={setDeleteConfirm}
 setCurrentPage={setCurrentPage}
 />

 {detailUser && (
 <UserDetailModal
 user={detailUser}
 characters={userCharacters}
 savesCount={userSavesCount}
 loading={detailLoading}
 onClose={() => setDetailUser(null)}
 />
 )}

 {/* Edit Modal */}
 <UserEditModal
 isOpen={isModalOpen}
 editingUser={editingUser}
 formData={formData}
 onFormChange={setFormData}
 onSubmit={handleSubmit}
 onClose={closeModal}
 />

 {/* Delete Confirmation Modal */}
 <DeleteConfirmModal
 deleteConfirm={deleteConfirm}
 onClose={() => setDeleteConfirm(null)}
 onDelete={handleDelete}
 />
 </div>
 );
}

