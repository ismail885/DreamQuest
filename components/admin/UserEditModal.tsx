"use client";

import { User, UserRole } from "@/types";
import { X } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c1322] border border-gray-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {editingUser
              ? "Modifier l'utilisateur"
              : "Nouvel utilisateur"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
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
              onClick={onClose}
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
  );
}
