"use client";

import { Search, X } from "lucide-react";
import { useAdminCharacters } from "@/hooks/admin/useAdminCharacters";
import AdminCharactersTable from "@/components/admin/AdminCharactersTable";
import CharacterViewModal from "@/components/admin/CharacterViewModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminCharactersPage() {
  const { t } = useLanguage();
  const {
    characters, loading, searchTerm, currentPage, totalCount, totalPages,
    viewCharacter, deleteConfirm, actionError,
    setSearchTerm, setCurrentPage,
    setViewCharacter, setDeleteConfirm, setActionError,
    handleDelete,
  } = useAdminCharacters();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("admin.charactersManagement")}</h1>
          <p className="text-gray-400 mt-1 sm:mt-2">
            {totalCount} {t("admin.management.charactersCount")}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          aria-label={t("admin.tables.searchCharacters")}
          placeholder={t("admin.tables.searchCharacters")}
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
      <AdminCharactersTable
        characters={characters}
        loading={loading}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        onView={setViewCharacter}
        onDelete={setDeleteConfirm}
        setCurrentPage={setCurrentPage}
      />

      {/* View Modal */}
      <CharacterViewModal
        character={viewCharacter}
        onClose={() => setViewCharacter(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onDelete={handleDelete}
        itemLabel={t("admin.confirmDeleteCharacterDesc")}
      />
    </div>
  );
}

