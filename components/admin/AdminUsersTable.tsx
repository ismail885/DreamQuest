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

function getRoleBadge(role: string) {
  const styles: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    createur: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    joueur: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };
  const labels: Record<string, string> = {
    admin: "Admin",
    createur: "Créateur",
    joueur: "Joueur",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs border ${styles[role] || styles.joueur}`}
    >
      {labels[role] || "Joueur"}
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
  return (
    <div className="bg-[#0c1322] border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-4 text-left text-gray-400 font-medium text-sm w-12">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-white"
                >
                  {selectedUsers.size === users.length && users.length > 0 ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">
                Utilisateur
              </th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">
                Email
              </th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">
                Rôle
              </th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium text-sm">
                Inscription
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium text-sm">
                Actions
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
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <button
                      onClick={() =>
                        user.id && toggleSelectUser(user.id)
                      }
                      className="text-gray-400 hover:text-white"
                    >
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
                        {user.nom_utilisateur
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="text-white font-medium">
                        {user.nom_utilisateur}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(
                      user.date_creation,
                    ).toLocaleDateString("fr-FR")}
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
                        onClick={() => loadUserDetails(user)}
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

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Affichage{" "}
            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
            {Math.min(
              currentPage * ITEMS_PER_PAGE,
              totalCount,
            )}{" "}
            sur {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => {
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
              },
            )}
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(totalPages, p + 1),
                )
              }
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
