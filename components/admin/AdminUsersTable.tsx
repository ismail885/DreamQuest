"use client";

import { User } from "@/types";
import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

const ITEMS_PER_PAGE = 10;

interface AdminUsersTableProps {
  users: User[];
  loading: boolean;
  selectedUsers: Set<number>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  toggleSelectAll: () => void;
  toggleSelectUser: (userId: number) => void;
  openModal: (user?: User) => void;
  loadUserDetails: (user: User) => void;
  setDeleteConfirm: (id: number | null) => void;
  setCurrentPage: (
    page: number | ((prev: number) => number),
  ) => void;
}

function getRoleBadge(role: string, t: (key: TranslationKey) => string) {
  const styles: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    createur: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    joueur: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };
  const labels: Record<string, string> = {
    admin: t("admin.roles.admin"),
    createur: t("admin.roles.createur"),
    joueur: t("admin.roles.joueur"),
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs border ${styles[role] || styles.joueur}`}
    >
      {labels[role] || t("admin.roles.joueur")}
    </span>
  );
}

export default function AdminUsersTable({
  users,
  loading,
  selectedUsers,
  totalCount,
  totalPages,
  currentPage,
  toggleSelectAll,
  toggleSelectUser,
  openModal,
  loadUserDetails,
  setDeleteConfirm,
  setCurrentPage,
}: AdminUsersTableProps) {
  const { t } = useLanguage();
  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-2 sm:px-4 py-4 w-10 sm:w-12">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-white"
                >
                  {selectedUsers.size === users.length && users.length > 0 ? (
                    <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </th>
              <th className="px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">
                {t("admin.tables.user")}
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">
                {t("admin.tables.email")}
              </th>
              <th className="px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">
                {t("admin.tables.roleLabel")}
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-4 text-left text-gray-300 font-medium text-xs sm:text-sm">
                {t("admin.tables.registrationDate")}
              </th>
              <th className="px-3 sm:px-6 py-4 text-right text-gray-300 font-medium text-xs sm:text-sm">
                {t("admin.tables.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  {t("admin.tables.noUsers")}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-cyan-500/10/30 transition-colors"
                >
                  <td className="px-2 sm:px-4 py-4">
                    <button
                      onClick={() =>
                        user.id && toggleSelectUser(user.id)
                      }
                      className="text-gray-400 hover:text-white"
                    >
                      {selectedUsers.has(user.id!) ? (
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-base flex-shrink-0">
                        {user.nom_utilisateur
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="text-white font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                        {user.nom_utilisateur}
                      </span>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-4 text-gray-400 text-sm">
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    {getRoleBadge(user.role, t)}
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-gray-400 text-sm">
                    {new Date(
                      user.date_creation,
                    ).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-card transition-colors"
                        title={t("admin.actions.edit")}
                      >
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => loadUserDetails(user)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-card transition-colors"
                        title={t("admin.actions.view")}
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
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
