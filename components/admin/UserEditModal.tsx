"use client";

import { User, UserRole } from "@/types";
import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface UserEditModalProps {
  isOpen: boolean;
  editingUser: User | null;
  formData: {
    nom_utilisateur: string;
    email: string;
    role: UserRole;
  };
  onFormChange: (data: {
    nom_utilisateur: string;
    email: string;
    role: UserRole;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function UserEditModal({
  isOpen,
  editingUser,
  formData,
  onFormChange,
  onSubmit,
  onClose,
}: UserEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmitWithLoading = async (e: React.FormEvent) => {
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-base w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/15">
          <h2 className="text-xl font-bold text-white">
            {editingUser
              ? t("admin.editUser")
              : "Nouvel utilisateur"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmitWithLoading} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              value={formData.nom_utilisateur}
              onChange={(e) =>
                onFormChange({ ...formData, nom_utilisateur: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/15 rounded-card text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                onFormChange({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/15 rounded-card text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  role: e.target.value as UserRole,
                })
              }
              className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/15 rounded-card text-white focus:outline-none focus:border-primary"
            >
              <option value="joueur">{t("admin.roles.joueur")}</option>
              <option value="createur">{t("admin.roles.createur")}</option>
              <option value="admin">{t("admin.roles.admin")}</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-cyan-500/15 text-gray-400 rounded-card hover:bg-cyan-500/10 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded-card hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("common.save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
