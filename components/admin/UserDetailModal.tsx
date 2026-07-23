"use client";

import { User } from "@/types";
import { X, BookOpen, UserRound } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface UserDetailModalProps {
  user: User | null;
  characters: { id: number; nom_personnage: string; classe: string; niveau: number }[];
  savesCount: number;
  loading: boolean;
  onClose: () => void;
}

export default function UserDetailModal({
  user,
  characters,
  savesCount,
  loading,
  onClose,
}: UserDetailModalProps) {
  const { t } = useLanguage();
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-base w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/15 sticky top-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">
              {user.nom_utilisateur.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {user.nom_utilisateur}
              </h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-card">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                {t("admin.tables.roleLabel")}
              </p>
              <p className="text-white font-medium">{user.role}</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-card">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                {t("admin.tables.registrationDate")}
              </p>
              <p className="text-white font-medium">
                {new Date(user.date_creation).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <UserRound className="w-5 h-5 text-cyan-400" />
              {t("admin.characters")} ({characters.length})
            </h3>
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-cyan-500 mx-auto" />
            ) : characters.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("admin.tables.noCharacters")}</p>
            ) : (
              <div className="space-y-2">
                {characters.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-card"
                  >
                    <div>
                      <span className="text-white font-medium">
                        {c.nom_personnage}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({c.classe})
                      </span>
                    </div>
                    <span className="text-cyan-400 text-sm">
                      {t("character.level")} {c.niveau}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-card">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">
              {savesCount} sauvegarde{savesCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
