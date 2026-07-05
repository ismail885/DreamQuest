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
 setActionError, setDeleteConfirm,
 toggleSelectAll, toggleSelectUser, clearSelection,
 handleBulkDelete, handleBulkRoleChange,
 openModal, closeModal, handleSubmit, handleDelete,
 loadUserDetails,
 } = useAdminUsers();

 return (
 <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestion des utilisateurs</h1>
          <p className="text-gray-400 mt-1 sm:mt-2">{totalCount} utilisateur{totalCount !== 1 ? "s" : ""} enregistré{totalCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
 <input
 type="text"
 aria-label="Rechercher un utilisateur par nom ou email"
 placeholder="Rechercher par nom ou email..."
 value={searchTerm}
 onChange={(e) => {
 setSearchTerm(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full pl-12 pr-10 py-3 card-base text-white placeholder:text-gray-400 focus:outline-none focus:border-primary"
 />
 {searchTerm && (
 <button
 onClick={() => {
 setSearchTerm("");
 setCurrentPage(1);
 }}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
 title="Effacer la recherche"
 >
 <X className="w-5 h-5" />
 </button>
 )}
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

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-card">
          <span className="text-white font-medium whitespace-nowrap">{selectedUsers.size} sélectionné{selectedUsers.size > 1 ? "s" : ""}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleBulkRoleChange("joueur")}
              className="px-2.5 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-card hover:bg-cyan-500/30 text-xs sm:text-sm"
            >
              Joueur
            </button>
            <button
              onClick={() => handleBulkRoleChange("createur")}
              className="px-2.5 py-1.5 bg-purple-500/20 text-purple-400 rounded-card hover:bg-purple-500/30 text-xs sm:text-sm"
            >
              Créateur
            </button>
            <button
              onClick={() => handleBulkRoleChange("admin")}
              className="px-2.5 py-1.5 bg-red-500/20 text-red-400 rounded-card hover:bg-red-500/30 text-xs sm:text-sm"
            >
              Admin
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1.5 bg-red-500/20 text-red-400 rounded-card hover:bg-red-500/30 text-xs sm:text-sm"
            >
              Supprimer
            </button>
          </div>
          <button onClick={() => clearSelection()} className="text-gray-400 hover:text-white">
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

